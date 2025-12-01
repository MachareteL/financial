import { IPaymentGateway } from "@/domain/interfaces/payment-gateway.interface";

import type { AnalyticsService } from "@/domain/interfaces/analytics-service.interface";

export class SubscribeTeamUseCase {
  constructor(
    private paymentGateway: IPaymentGateway,
    private analyticsService: AnalyticsService
  ) {}

  async execute(
    teamId: string,
    planId: string,
    email: string,
    successUrl: string,
    cancelUrl: string,
    userId?: string
  ): Promise<string> {
    if (userId) {
      await this.analyticsService.track(userId, "checkout_started", {
        plan: planId,
      });
    }

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
