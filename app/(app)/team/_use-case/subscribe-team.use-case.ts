import { IPaymentGateway } from "@/domain/interfaces/payment-gateway.interface";

export class SubscribeTeamUseCase {
  constructor(private paymentGateway: IPaymentGateway) {}

  async execute(
    teamId: string,
    planId: string,
    email: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    const checkoutUrl = await this.paymentGateway.createCheckoutSession(
      teamId,
      planId,
      email,
      successUrl,
      cancelUrl
    );

    return checkoutUrl;
  }
}
