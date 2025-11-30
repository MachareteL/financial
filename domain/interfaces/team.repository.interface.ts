import type { TeamInviteDetailsDTO } from "@/domain/dto/team.types.d.ts";
import { Team } from "@/domain/entities/team";
import type { TeamRole, TeamRoleProps } from "../entities/team-role";
import type { TeamInvite, TeamInviteProps } from "../entities/team-invite";
import type { TeamMemberProfileDTO } from "../dto/team.types.d.ts";

export interface ITeamRepository {
  // Team Management
  createTeam(
    teamName: string,
    adminUserId: string,
    trialEndsAt?: Date
  ): Promise<Team>;
  updateTeam(teamId: string, name: string): Promise<void>;
  countTeamsByOwner(userId: string): Promise<number>;
  getTeamsByOwner(userId: string): Promise<Team[]>;
  countMembersWithPermission(
    teamId: string,
    permission: string
  ): Promise<number>;
  getTeamById(teamId: string): Promise<Team | null>;

  // Members
  getTeamMembers(teamId: string): Promise<TeamMemberProfileDTO[]>;
  updateMemberRole(
    teamId: string,
    memberId: string,
    roleId: string | null
  ): Promise<void>;
  removeMember(teamId: string, memberId: string): Promise<void>;

  // Roles
  getTeamRoles(teamId: string): Promise<TeamRole[]>;
  createTeamRole(
    role: Omit<TeamRoleProps, "id" | "createdAt" | "updatedAt">
  ): Promise<TeamRole>;
  updateTeamRole(
    roleId: string,
    teamId: string,
    data: Partial<TeamRoleProps>
  ): Promise<TeamRole>;
  deleteTeamRole(roleId: string, teamId: string): Promise<void>;

  // Invites
  getTeamInvites(teamId: string): Promise<TeamInvite[]>;
  createTeamInvite(
    invite: Omit<TeamInviteProps, "id" | "createdAt">
  ): Promise<TeamInvite>;
  deleteTeamInvite(inviteId: string, teamId: string): Promise<void>; // Cancelar convite (pelo admin)

  // User Invites (Onboarding)
  getPendingInvitesByEmail(email: string): Promise<TeamInviteDetailsDTO[]>;
  acceptInvite(
    inviteId: string,
    userId: string
  ): Promise<{ teamId: string; teamName: string }>;
  declineInvite(inviteId: string): Promise<void>;

  // Permissions
  verifyPermission(
    userId: string,
    teamId: string,
    permission: string
  ): Promise<boolean>;
}
