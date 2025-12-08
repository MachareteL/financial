"use client";

import type { Subscription } from "@/domain/entities/subscription";
import type { Team } from "@/domain/entities/team";
import { SubscriptionAlerts } from "./billing/subscription-alerts";
import { ActivePlanCard } from "./billing/active-plan-card";
import { UpgradePricingCards } from "./billing/upgrade-pricing-cards";

interface TeamBillingSectionProps {
  team: Team;
  subscription: Subscription | null;
}

export function TeamBillingSection({
  team,
  subscription,
}: TeamBillingSectionProps) {
  // Logic to determine states
  const isPro = team.isPro(!!subscription && subscription.isActive());

  // Trial Logic
  const trialEndsAt = team.trialEndsAt ? new Date(team.trialEndsAt) : null;
  const isTrialActive = trialEndsAt ? trialEndsAt > new Date() : false;

  const daysRemaining = trialEndsAt
    ? Math.ceil(
        (trialEndsAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  // View Logic
  // Show "Dashboard View" only if they have a REAL subscription (Active or Past Due or Trials originating from Stripe)
  // If they are on the "Free Trial" (no card attached, just time based), they should see the Upgrade view.

  // Note: team.isPro() returns true for both Trial and Subscription.
  // We want to show the "ActivePlanCard" ONLY if they have a subscription object that is NOT just a placeholder (if we had those).
  // But here subscription is the entity from Stripe.

  const showActiveDashboard = subscription && subscription.isActive();

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
