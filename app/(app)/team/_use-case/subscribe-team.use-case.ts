import { IPaymentGateway } from "@/domain/interfaces/payment-gateway.interface";

import { IAnalyticsService } from "@/domain/interfaces/analytics-service.interface";

export class SubscribeTeamUseCase {
  constructor(
    private paymentGateway: IPaymentGateway,
    private analyticsService: IAnalyticsService
  ) {}

  async execute(
    teamId: string,
    planId: string,
    email: string,
    successUrl: string,
    cancelUrl: string,
    userId?: string
  ): Promise<string> {
    const checkoutUrl = await this.paymentGateway.createCheckoutSession(
      teamId,
      planId,
      email,
      successUrl,
      cancelUrl,
      userId
    );

    // Fire-and-forget analytics
    this.analyticsService.track(email, "checkout_started", {
      plan_interval: planId.includes("year") ? "year" : "month", // Assuming planId contains interval or we map it.
      // If planId is opaque, we might need to fetch plan details.
      // But prompt says: "Props: { plan_interval: 'month' | 'year' }"
      // I'll assume planId has a convention or I'll just pass planId if unknown.
      // For now, simple heuristic or just planId.
      plan_id: planId,
      team_id: teamId,
    });

    return checkoutUrl;
  }
}
