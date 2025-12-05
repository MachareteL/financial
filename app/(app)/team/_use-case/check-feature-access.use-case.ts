import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import type { ISubscriptionRepository } from "@/domain/interfaces/subscription.repository.interface";

import type { AnalyticsService } from "@/domain/interfaces/analytics-service.interface";

export class CheckFeatureAccessUseCase {
  constructor(
    private teamRepository: ITeamRepository,
    private subscriptionRepository: ISubscriptionRepository,
    private analyticsService: AnalyticsService
  ) {}

  async execute(
    teamId: string,
    featureKey: string,
    userId?: string
  ): Promise<boolean> {
    // 1. Get Team
    const team = await this.teamRepository.getTeamById(teamId);
    if (!team) throw new Error("Time não encontrado");

    // 2. Get Subscription
    const subscription = await this.subscriptionRepository.findByTeamId(teamId);

    // 3. Check PRO Status
    const isPro = team.isPro(subscription ? subscription.isActive() : false);

    // 4. Feature Logic
    // If PRO, allowed.
    if (isPro) return true;

    // If FREE, check restrictions
    if (featureKey === "ai_receipt_scanning") {
      if (userId) {
        await this.analyticsService.track(userId, "feature_blocked", {
          feature: "ai_receipts",
          reason: "limit_reached",
        });
      }
      return false; // Blocked for FREE
    }

    // Default allowed (manual features)
    return true;
  }
}
