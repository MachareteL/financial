import type { Team } from "../entities/team";
import type { TeamRole, TeamRoleProps } from "../entities/team-role";
import type { TeamInvite, TeamInviteProps } from "../entities/team-invite";
import type { TeamMemberProfileDTO } from "../dto/team.types.d.ts";

export interface ITeamRepository {
  createTeam(teamName: string, adminUserId: string): Promise<Team>;

  getTeamMembers(teamId: string): Promise<TeamMemberProfileDTO[]>;

  getTeamRoles(teamId: string): Promise<TeamRole[]>;
  
  createTeamRole(role: Omit<TeamRoleProps, "id" | "createdAt" | "updatedAt">): Promise<TeamRole>;
  updateTeamRole(roleId: string, teamId: string, data: Partial<TeamRoleProps>): Promise<TeamRole>;
  deleteTeamRole(roleId: string, teamId: string): Promise<void>;

  getTeamInvites(teamId: string): Promise<TeamInvite[]>;

  createTeamInvite(invite: Omit<TeamInviteProps, "id" | "createdAt">): Promise<TeamInvite>;

  updateTeamInvite(inviteId: string, teamId: string, status: TeamInviteProps["status"]): Promise<TeamInvite>;
}