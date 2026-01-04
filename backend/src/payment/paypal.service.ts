import { Injectable } from '@nestjs/common';
import * as paypal from '@paypal/checkout-server-sdk';

@Injectable()
export class PaypalService {
  private client: paypal.core.PayPalHttpClient;

  constructor() {
    const env =
      process.env.PAYPAL_MODE === 'live'
        ? new paypal.core.LiveEnvironment(
            process.env.PAYPAL_CLIENT_ID!,
            process.env.PAYPAL_CLIENT_SECRET!,
          )
        : new paypal.core.SandboxEnvironment(
            process.env.PAYPAL_CLIENT_ID!,
            process.env.PAYPAL_CLIENT_SECRET!,
          );

    this.client = new paypal.core.PayPalHttpClient(env);
  }

  createOrder(
    amount: number,
    currency = 'ILS',
    intent: 'AUTHORIZE' | 'CAPTURE' = 'AUTHORIZE',
  ) {
    const req = new paypal.orders.OrdersCreateRequest();
    req.prefer('return=representation');
    req.requestBody({
      intent: intent,
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
        },
      ],
    });
    return this.client.execute(req);
  }

  async authorize(orderId: string) {
    const req = new paypal.orders.OrdersAuthorizeRequest(orderId);
    req.requestBody({});
    const response = await this.client.execute(req);
    const authorizationId =
      response.result.purchase_units[0].payments.authorizations[0].id;
    return { response, authorizationId };
  }

  capture(authorizationId: string) {
    const req = new paypal.payments.AuthorizationsCaptureRequest(authorizationId);
    req.requestBody({});
    return this.client.execute(req);
  }

  refund(captureId: string) {
    const req = new paypal.payments.CapturesRefundRequest(captureId);
    req.requestBody({});
    return this.client.execute(req);
  }
}
