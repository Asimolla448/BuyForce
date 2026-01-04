import { Module } from '@nestjs/common';
import { PaymentsService } from './payment.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaypalService } from './paypal.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PaymentsController } from './payment.controller';

@Module({
  providers: [
    PaymentsService,
    PrismaService,
    PaypalService,
    NotificationsService,
  ],
  controllers: [PaymentsController],
  exports: [PaymentsService, PaypalService], // אם אתה רוצה להזריק אותו במודולים אחרים
})
export class PaymentModule {}
