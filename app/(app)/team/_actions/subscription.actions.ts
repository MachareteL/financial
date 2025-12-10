"use server";

import { getSupabaseClient } from "@/infrastructure/database/supabase.server";
import {
  getSubscribeTeamUseCase,
  getManageSubscriptionUseCase,
  getGetSubscriptionStatusUseCase,
  getVerifyTeamPermissionUseCase,
} from "@/infrastructure/dependency-injection/server-container";

export async function subscribeTeamAction(teamId: string, planId: string) {
  const supabase = await getSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    throw new Error("Unauthorized or missing email");
  }

  const verifyTeamPermissionUseCase = await getVerifyTeamPermissionUseCase();
  const hasPermission = await verifyTeamPermissionUseCase.execute(
    user.id,
    teamId,
    "MANAGE_TEAM"
  );

  if (!hasPermission) {
    throw new Error(
      "Você não tem permissão para assinar planos para este time."
    );
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

  return url;
}

export async function manageSubscriptionAction(teamId: string) {
  const supabase = await getSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const verifyTeamPermissionUseCase = await getVerifyTeamPermissionUseCase();
  const hasPermission = await verifyTeamPermissionUseCase.execute(
    user.id,
    teamId,
    "MANAGE_TEAM"
  );

  if (!hasPermission) {
    throw new Error("Você não tem permissão para gerenciar assinaturas.");
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const returnUrl = `${baseUrl}/team`;

  const manageSubscriptionUseCase = await getManageSubscriptionUseCase();
  const url = await manageSubscriptionUseCase.execute(teamId, returnUrl);

  return url;
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
