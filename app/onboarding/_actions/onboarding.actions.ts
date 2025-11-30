"use server";

import {
  createTeamUseCase,
  getPendingInvitesUseCase,
  acceptInviteUseCase,
  declineInviteUseCase,
} from "@/infrastructure/dependency-injection";
import type { TeamInviteDetailsDTO } from "@/domain/dto/team.types";

import type { Team } from "@/domain/entities/team";

export async function createTeamAction(
  teamName: string,
  userId: string
): Promise<Team> {
  return await createTeamUseCase.execute({ teamName, userId });
}

export async function getPendingInvitesAction(
  email: string
): Promise<TeamInviteDetailsDTO[]> {
  return await getPendingInvitesUseCase.execute(email);
}

export async function acceptInviteAction(
  inviteId: string,
  userId: string
): Promise<void> {
  await acceptInviteUseCase.execute(inviteId, userId);
}

export async function declineInviteAction(inviteId: string): Promise<void> {
  await declineInviteUseCase.execute(inviteId);
}
