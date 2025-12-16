"use client";

import type { SubscriptionDTO } from "@/domain/dto/subscription.types.d.ts";
import type { TeamDTO } from "@/domain/dto/team.types.d.ts";
import { DateUtils } from "@/domain/utils/date.utils";
import { SubscriptionAlerts } from "./billing/subscription-alerts";
import { ActivePlanCard } from "./billing/active-plan-card";
import { UpgradePricingCards } from "./billing/upgrade-pricing-cards";

interface TeamBillingSectionProps {
  team: TeamDTO;
  subscription: SubscriptionDTO | null;
}

export function TeamBillingSection({
  team,
  subscription,
}: TeamBillingSectionProps) {
  // Logic to determine states
  const trialEndsAt = DateUtils.parse(team.trialEndsAt);
  const isTrialActive = trialEndsAt ? trialEndsAt > new Date() : false;
  const isSubscriptionActive =
    subscription?.status === "active" || subscription?.status === "trialing";
  const isPro = isTrialActive || isSubscriptionActive;

  const daysRemaining = trialEndsAt
    ? Math.ceil(
        (trialEndsAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  // View Logic
  // Show "Dashboard View" only if they have a REAL subscription (Active or Past Due or Trials originating from Stripe)
  const showActiveDashboard = isSubscriptionActive;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* 1. Alerts Section - Always visible if conditions met */}
      <SubscriptionAlerts
        subscription={subscription}
        isPro={isPro}
        isTrialActive={isTrialActive}
        daysRemaining={daysRemaining}
      />

      {/* 2. Main Content Area */}
      {showActiveDashboard ? (
        // DASHBOARD VIEW: For users with an Stripe Subscription (Active or Trialing)
        <ActivePlanCard subscription={subscription} teamId={team.id} />
      ) : (
        // CONVERSION VIEW: For Free users or Users on generic Trial without Subscription
        <UpgradePricingCards teamId={team.id} isTrialActive={isTrialActive} />
      )}
    </div>
  );
}
