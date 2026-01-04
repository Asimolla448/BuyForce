import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { SeedAdminService } from './seed/admin.seed';

import { PaypalService } from './payment/paypal.service';
import { PaymentsService } from './payment/payment.service';
import { PaymentsController } from './payment/payment.controller';
import { PaypalWebhooksController } from './webhooks/paypal.webhooks.controller';
import { NotificationsService } from './notifications/notifications.service';
import { RedisModule } from './redis/redis.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaypalWebhooksModule } from './webhooks/paypal.webhooks.module';

@Module({
  imports: [
    PaypalWebhooksModule,
    PrismaModule,
    ProductsModule,
    AuthModule,
    NotificationsModule,
  ],
  controllers: [AppController, PaymentsController, PaypalWebhooksController],
  providers: [
    AppService,
    SeedAdminService,
    PaypalService,
    PaymentsService,
    NotificationsService,
    RedisModule,
  ],
})
export class AppModule {}
