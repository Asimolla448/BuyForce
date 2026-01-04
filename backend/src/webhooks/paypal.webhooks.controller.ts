import { Controller, Post, Body, Logger } from '@nestjs/common';
import { PaypalWebhooksService } from './paypal.webhooks.service';

@Controller('webhooks/paypal')
export class PaypalWebhooksController {
  private readonly logger = new Logger(PaypalWebhooksController.name);

  constructor(private readonly webhooksService: PaypalWebhooksService) {}

  @Post()
  async handle(@Body() body: any) {
    try {
      await this.webhooksService.handleEvent(body);
      return { status: 'ok' };
    } catch (err) {
      this.logger.error('Error in PayPal webhook controller', err);
      return { status: 'error' };
    }
  }
}
