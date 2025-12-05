"use server";

import { getPendingInvitesUseCase } from "@/infrastructure/dependency-injection";

export async function getPendingInvitesAction(email: string) {
  try {
    const invites = await getPendingInvitesUseCase.execute(email);
    return invites;
  } catch (error) {
    console.error("Error fetching pending invites:", error);
    return [];
  }
}
