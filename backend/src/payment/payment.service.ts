import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaypalService } from './paypal.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Payment } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paypal: PaypalService,
    private readonly notifications: NotificationsService,
  ) {}

  async createPayment(userId: number, productId: number) {
    const exists = await this.prisma.prisma.payment.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (exists) {
      throw new BadRequestException('כבר הצטרפת למוצר');
    }

    const product = await this.prisma.prisma.product.findUnique({
      where: { id: productId },
      include: { joinedUsers: true },
    });

    if (!product) {
      throw new BadRequestException('המוצר לא קיים');
    }

    if (product.status !== 'ACTIVE') {
      throw new BadRequestException('המוצר אינו פעיל');
    }

    if (product.joinedUsers.length >= product.targetUsersCount) {
      throw new BadRequestException('הקבוצה מלאה');
    }

    const order = await this.paypal.createOrder(1);

    await this.prisma.prisma.product.update({
      where: { id: productId },
      data: { joinedUsers: { connect: { id: userId } } },
    });

    const payment = await this.prisma.prisma.payment.create({
      data: {
        userId,
        productId,
        paypalOrderId: order.result.id,
        amount: 1,
        status: 'PENDING',
      },
    });

    return payment;
  }

  async approvePayment(paypalOrderId: string) {
    const payment = await this.prisma.prisma.payment.findUnique({
      where: { paypalOrderId },
      include: { product: true },
    });

    if (!payment) {
      throw new BadRequestException('תשלום לא נמצא');
    }

    const updated = await this.prisma.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'APPROVED' },
    });

    await this.notifications.create(
      payment.userId,
      'הצטרפת למוצר!',
      `אמתת את התשלום הראשוני עבור המוצר "${payment.product.name}". ההצטרפות תתבצע סופית אם המוצר יגיע ליעד.`,
    );

    return updated;
  }

  async capture(orderId: string) {
    return await this.paypal.capture(orderId);
  }

  async finalizePayments(productId: number, newStatus?: 'COMPLETED' | 'FAILED') {
    console.log('FINALIZE ENTER', productId, newStatus);
    const product = await this.prisma.prisma.product.findUnique({
      where: { id: productId },
      include: { joinedUsers: true, payments: true },
    });

    if (!product) throw new BadRequestException('המוצר לא קיים');

    const statusToUse = newStatus;

    const pendingPayments = await this.prisma.prisma.payment.findMany({
      where: { productId, status: { in: ['PENDING', 'APPROVED'] } },
    });

    if (statusToUse === 'COMPLETED') {
      const paid: Payment[] = [];

      for (const payment of pendingPayments) {
        await this.paypal.capture(payment.paypalOrderId);

        const updated = await this.prisma.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'PAID', amount: product.discountedPrice },
        });

        await this.notifications.create(
          payment.userId,
          'חויבת בהצלחה!',
          `חויבת במחיר המוזל של המוצר "${product.name}" והצטרפותך נספרה.`,
        );

        paid.push(updated);
      }

      console.log('FINALIZE CALLED', productId, newStatus);

      return paid;
    }

    if (statusToUse === 'FAILED') {
      const refunded: Payment[] = [];

      for (const payment of pendingPayments) {
        const updated = await this.prisma.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED', amount: 0 },
        });

        await this.notifications.create(
          payment.userId,
          'קבוצה נכשלה',
          `לא חויבת – המוצר "${product.name}" לא הגיע ליעד המשתמשים.`,
        );

        refunded.push(updated);
      }

      return refunded;
    }

    return [];
  }

  async findAllPayments() {
    return await this.prisma.prisma.payment.findMany({
      include: { user: true, product: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
