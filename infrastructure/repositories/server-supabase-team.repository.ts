import { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import { Team } from "@/domain/entities/team";
import { getSupabaseClient } from "../database/supabase.server";
import { TeamRole } from "@/domain/entities/team-role";
import { TeamInvite } from "@/domain/entities/team-invite";
import {
  TeamMemberProfileDTO,
  TeamInviteDetailsDTO,
} from "@/domain/dto/team.types";

export class ServerSupabaseTeamRepository implements ITeamRepository {
  async getTeamById(teamId: string): Promise<Team | null> {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .eq("id", teamId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    return new Team({
      id: data.id,
      name: data.name,
      createdAt: new Date(data.created_at),
      createdBy: data.created_by!,
      trialEndsAt: data.trial_ends_at
        ? new Date(data.trial_ends_at)
        : undefined,
    });
  }
  async verifyPermission(
    userId: string,
    teamId: string,
    permission: string
  ): Promise<boolean> {
    const supabase = await getSupabaseClient();

    const { data: member, error } = await supabase
      .from("team_members")
      .select(
        `
        role_id,
        team_roles (name, permissions)
      `
      )
      .eq("team_id", teamId)
      .eq("profile_id", userId)
      .single();

    if (error || !member || !member.team_roles) return false;

    const roleName = member.team_roles.name;
    const permissions = (member.team_roles.permissions as string[]) || [];

    if (
      roleName === "Proprietário" ||
      roleName === "Owner" ||
      roleName === "Administrador"
    ) {
      return true;
    }

    return permissions.includes(permission);
  }

  async createTeam(
    teamName: string,
    createdBy: string,
    trialEndsAt?: Date
  ): Promise<Team> {
    throw new Error("Disabled server method.");
  }
  async updateTeam(teamId: string, name: string): Promise<void> {
    throw new Error("Disabled server method.");
  }
  async countTeamsByOwner(userId: string): Promise<number> {
    throw new Error("Disabled server method.");
  }
  async getTeamMembers(teamId: string): Promise<TeamMemberProfileDTO[]> {
    throw new Error("Disabled server method.");
  }
  async updateMemberRole(
    teamId: string,
    memberId: string,
    roleId: string | null
  ): Promise<void> {
    throw new Error("Disabled server method.");
  }
  async removeMember(teamId: string, memberId: string): Promise<void> {
    throw new Error("Disabled server method.");
  }
  async getTeamRoles(teamId: string): Promise<TeamRole[]> {
    throw new Error("Disabled server method.");
  }
  async createTeamRole(role: any): Promise<TeamRole> {
    throw new Error("Disabled server method.");
  }
  async updateTeamRole(
    roleId: string,
    teamId: string,
    data: any
  ): Promise<TeamRole> {
    throw new Error("Disabled server method.");
  }
  async deleteTeamRole(roleId: string, teamId: string): Promise<void> {
    throw new Error("Disabled server method.");
  }
  async getTeamInvites(teamId: string): Promise<TeamInvite[]> {
    throw new Error("Disabled server method.");
  }
  async createTeamInvite(invite: any): Promise<TeamInvite> {
    throw new Error("Disabled server method.");
  }
  async deleteTeamInvite(inviteId: string, teamId: string): Promise<void> {
    throw new Error("Disabled server method.");
  }
  async getPendingInvitesByEmail(
    email: string
  ): Promise<TeamInviteDetailsDTO[]> {
    throw new Error("Disabled server method.");
  }
  async acceptInvite(inviteId: string, userId: string): Promise<void> {
    throw new Error("Disabled server method.");
  }
  async declineInvite(inviteId: string): Promise<void> {
    throw new Error("Disabled server method.");
  }
}
