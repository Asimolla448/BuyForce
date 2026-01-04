import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PaymentsService } from '../payment/payment.service';

@Injectable()
export class PaypalWebhooksService {
  private readonly logger = new Logger(PaypalWebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async handleEvent(body: any) {
    try {
      const eventType = body.event_type;
      const orderId =
        body.resource?.id ||
        body.resource?.supplementary_data?.related_ids?.order_id;

      if (!orderId) return this.logger.warn('No orderId in webhook');

      this.logger.log(`Received PayPal webhook: ${eventType} for order ${orderId}`);

      if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
        await this.handlePaymentCompleted(orderId);
      }
    } catch (err) {
      this.logger.error('Error handling PayPal webhook', err);
    }
  }

  private async handlePaymentCompleted(orderId: string) {
    const payment = await this.prisma.prisma.payment.update({
      where: { paypalOrderId: orderId },
      data: { status: 'PAID' },
      include: { product: true },
    });

    await this.prisma.prisma.product.update({
      where: { id: payment.productId },
      data: { joinedUsers: { connect: { id: payment.userId } } },
    });

   
    await this.notifications.create(
      payment.userId,
      'הצטרפת למוצר!',
      `אמתת את התשלום הראשוני עבור המוצר "${payment.product?.name ?? ''}". ההצטרפות תתבצע סופית אם המוצר יגיע ליעד.`
    );

    await this.notifications.create(
      payment.userId,
      'חויבת בהצלחה!',
      `חויבת במחיר המוזל של המוצר "${payment.product?.name ?? ''}" והצטרפותך נספרה.`
    );

    await this.paymentsService.finalizePayments(payment.productId);
  }
}
