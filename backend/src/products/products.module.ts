import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsService } from './products.service';
import { ProductsJsonService } from '../seed/products.seed';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { ProductsController } from './products.controller';
import { RedisModule } from 'src/redis/redis.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  imports: [
    PrismaModule,
    CloudinaryModule,
    RedisModule,
    NotificationsModule,
    PaymentModule,
  ],
  providers: [
    ProductsService,
    {
      provide: ProductsJsonService,
      useClass: ProductsJsonService,
    },
  ],
  controllers: [ProductsController],
  exports: [ProductsService, ProductsJsonService],
})
export class ProductsModule {}
