"use server";

import {
  getTeamDataUseCase,
  updateTeamUseCase,
  manageMembersUseCase,
  manageRolesUseCase,
  checkFeatureAccessUseCase,
} from "@/infrastructure/dependency-injection";
import type { TeamDataDTO } from "@/domain/dto/team.types";

export async function checkFeatureAccessAction(
  teamId: string,
  featureKey: string
): Promise<boolean> {
  return await checkFeatureAccessUseCase.execute(teamId, featureKey);
}

export async function getTeamDataAction(teamId: string): Promise<TeamDataDTO> {
  return await getTeamDataUseCase.execute(teamId);
}

export async function updateTeamAction(
  teamId: string,
  name: string,
  userId: string
): Promise<void> {
  await updateTeamUseCase.execute(teamId, name, userId);
}

export async function cancelInviteAction(
  inviteId: string,
  teamId: string,
  userId: string
): Promise<void> {
  await manageMembersUseCase.cancelInvite(inviteId, teamId, userId);
}

export async function inviteMemberAction(data: {
  teamId: string;
  email: string;
  roleId: string | null;
  invitedBy: string;
}): Promise<void> {
  await manageMembersUseCase.inviteMember(data);
}

export async function updateMemberRoleAction(data: {
  teamId: string;
  memberId: string;
  userId: string;
  roleId: string | null;
}): Promise<void> {
  await manageMembersUseCase.updateMemberRole(data);
}

export async function removeMemberAction(
  teamId: string,
  memberId: string,
  userId: string
): Promise<void> {
  await manageMembersUseCase.removeMember(teamId, memberId, userId);
}

export async function updateRoleAction(data: {
  roleId: string;
  teamId: string;
  userId: string;
  name: string;
  color: string;
  permissions: string[];
}): Promise<void> {
  await manageRolesUseCase.updateRole(data);
}

export async function createRoleAction(data: {
  teamId: string;
  userId: string;
  name: string;
  color: string;
  permissions: string[];
}): Promise<void> {
  await manageRolesUseCase.createRole(data);
}

export async function deleteRoleAction(
  roleId: string,
  teamId: string,
  userId: string
): Promise<void> {
  await manageRolesUseCase.deleteRole(roleId, teamId, userId);
}
