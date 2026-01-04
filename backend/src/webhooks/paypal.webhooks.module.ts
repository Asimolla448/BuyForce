import { Module } from '@nestjs/common';
import { PaypalWebhooksController } from './paypal.webhooks.controller';
import { PaypalWebhooksService } from './paypal.webhooks.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PaymentsService } from '../payment/payment.service';
import { PaypalService } from 'src/payment/paypal.service';

@Module({
  controllers: [PaypalWebhooksController],
  providers: [
    PaypalWebhooksService,
    PrismaService,
    NotificationsService,
    PaymentsService,
    PaypalService,
  ],
  exports: [PaypalWebhooksService],
})
export class PaypalWebhooksModule {}
