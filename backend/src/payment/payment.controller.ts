import { Controller, Post, Param, Req, UseGuards, Get } from '@nestjs/common';
import { PaymentsService } from './payment.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ParseIntPipe } from '@nestjs/common';
import { Body } from '@nestjs/common';

@Controller('payments')
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':productId')
  async create(@Req() req, @Param('productId') productId: string) {
    const userId = req.user.id;
    const productIdNumber = Number(productId);
    if (isNaN(productIdNumber)) {
      return {
        status: 'error',
        message: 'ProductId לא חוקי',
      };
    }

    try {
      const payment = await this.payments.createPayment(
        userId,
        productIdNumber,
      );
      return { id: payment.paypalOrderId };
    } catch (err: any) {
      console.error('Create Payment Error:', err);
      return {
        status: 'error',
        message: err.message || 'שגיאה ביצירת התשלום',
        details: err.response?.message || err.response || null,
      };
    }
  }

  @Post('approve/:orderId')
  async approve(@Param('orderId') orderId: string) {
    return this.payments.approvePayment(orderId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('capture/:orderId')
  async capture(@Param('orderId') orderId: string) {
    try {
      return await this.payments.capture(orderId);
    } catch (err: any) {
      console.error('Capture Payment Error:', err);
      return {
        status: 'error',
        message: err.message || 'שגיאה בביצוע התשלום',
        details: err.response?.message || err.response || null,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    try {
      return await this.payments.findAllPayments();
    } catch (err: any) {
      console.error('Error fetching payments', err);
      return {
        status: 'error',
        message: err.message || 'שגיאה בשליפת התשלומים',
      };
    }
  }
}
