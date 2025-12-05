"use server";

import { getSupabaseClient } from "@/infrastructure/database/supabase.server";
import {
  getSubscribeTeamUseCase,
  getManageSubscriptionUseCase,
  getGetSubscriptionStatusUseCase,
} from "@/infrastructure/dependency-injection/server-container";
import { redirect } from "next/navigation";

export async function subscribeTeamAction(teamId: string, planId: string) {
  const supabase = await getSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    throw new Error("Unauthorized or missing email");
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const successUrl = `${baseUrl}/team?success=true`;
  const cancelUrl = `${baseUrl}/team?canceled=true`;

  const subscribeTeamUseCase = getSubscribeTeamUseCase();
  const url = await subscribeTeamUseCase.execute(
    teamId,
    planId,
    user.email,
    successUrl,
    cancelUrl,
    user.id
  );
  if (url) {
    redirect(url);
  }
}

export async function manageSubscriptionAction(teamId: string) {
  const supabase = await getSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const returnUrl = `${baseUrl}/team`;

  const manageSubscriptionUseCase = await getManageSubscriptionUseCase();
  const url = await manageSubscriptionUseCase.execute(teamId, returnUrl);

  if (url) {
    redirect(url);
  }
}

export async function getSubscriptionStatusAction(teamId: string) {
  const supabase = await getSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const getSubscriptionStatusUseCase = await getGetSubscriptionStatusUseCase();
  const subscription = await getSubscriptionStatusUseCase.execute(teamId);

  if (!subscription) return null;

  return {
    status: subscription.status,
    currentPeriodEnd: subscription.currentPeriodEnd,
    isActive: subscription.isActive(),
  };
}
