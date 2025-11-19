import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import { Team } from "@/domain/entities/team";
import { TeamRole, type TeamRoleProps } from "@/domain/entities/team-role";
import {
  TeamInvite,
  type TeamInviteProps,
} from "@/domain/entities/team-invite";
import type { TeamMemberProfileDTO } from "@/domain/dto/team.types.d.ts";
import { getSupabaseClient } from "../database/supabase.client";
import type { Database } from "@/domain/dto/database.types.d.ts";

export class TeamRepository implements ITeamRepository {
  async createTeam(teamName: string, adminUserId: string): Promise<Team> {
    const supabase = getSupabaseClient();
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .insert({ name: teamName })
      .select()
      .single();

    if (teamError) throw new Error(teamError.message);

    const allPermissions = [
      "view_dashboard",
      "view_expenses",
      "create_expenses",
      "edit_expenses",
      "delete_expenses",
      "view_budget",
      "edit_budget",
      "view_investments",
      "edit_investments",
      "view_categories",
      "edit_categories",
      "manage_team",
      "manage_roles",
    ];

    const basicPermissions = [
      "view_dashboard",
      "view_expenses",
      "create_expenses",
      "view_budget",
      "view_investments",
      "view_categories",
    ];

    // Criar Cargo "Proprietário" (Owner)
    const ownerRoleData: Database["public"]["Tables"]["team_roles"]["Insert"] =
      {
        team_id: teamData.id,
        name: "Proprietário",
        color: "#eab308", // Dourado
        permissions: allPermissions,
        description: "Dono do time. Acesso total e irrestrito.",
      };

    const { data: ownerRole, error: ownerError } = await supabase
      .from("team_roles")
      .insert(ownerRoleData)
      .select("id")
      .single();

    if (ownerError) {
      await supabase.from("teams").delete().eq("id", teamData.id);
      throw new Error(ownerError.message);
    }

    // Criar Cargo "Membro" (Padrão)
    const memberRoleData: Database["public"]["Tables"]["team_roles"]["Insert"] =
      {
        team_id: teamData.id,
        name: "Membro",
        color: "#3b82f6", // Azul
        permissions: basicPermissions,
        description: "Acesso básico para visualização e criação.",
      };

    await supabase.from("team_roles").insert(memberRoleData);

    // Associar o criador como "Proprietário"
    const { error: memberError } = await supabase
      .from("team_members")
      .insert({
        profile_id: adminUserId,
        team_id: teamData.id,
        role_id: ownerRole.id,
      });

    if (memberError) {
      await supabase.from("teams").delete().eq("id", teamData.id);
      throw new Error(memberError.message);
    }

    return new Team({
      id: teamData.id,
      name: teamData.name,
      createdAt: new Date(teamData.created_at),
    });
  }

  async getTeamMembers(teamId: string): Promise<TeamMemberProfileDTO[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("team_members")
      .select(
        `
        role_id,
        profiles (id, name, email, created_at),
        team_roles (id, name, color)
      `
      )
      .eq("team_id", teamId);

    if (error) throw new Error(error.message);

    return (data || []).map((item: any) => ({
      id: item.profiles!.id,
      name: item.profiles!.name,
      email: item.profiles!.email,
      createdAt: item.profiles!.created_at,
      roleId: item.role_id,
      teamRole: item.team_roles
        ? {
            id: item.team_roles.id,
            name: item.team_roles.name,
            color: item.team_roles.color,
          }
        : undefined,
    }));
  }

  async updateMemberRole(
    teamId: string,
    memberId: string,
    roleId: string | null
  ): Promise<void> {
    if (!roleId) throw new Error("É necessário definir um cargo.");

    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("team_members")
      .update({ role_id: roleId })
      .eq("team_id", teamId)
      .eq("profile_id", memberId);

    if (error) throw new Error(error.message);
  }

  async removeMember(teamId: string, memberId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("team_id", teamId)
      .eq("profile_id", memberId);

    if (error) throw new Error(error.message);
  }

  async getTeamRoles(teamId: string): Promise<TeamRole[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("team_roles")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at");

    if (error) throw new Error(error.message);

    return (data || []).map(
      (item) =>
        new TeamRole({
          id: item.id,
          name: item.name,
          description: item.description || undefined,
          color: item.color,
          permissions: item.permissions as string[],
          teamId: item.team_id,
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at || item.created_at),
        })
    );
  }

  async createTeamRole(
    role: Omit<TeamRoleProps, "id" | "createdAt" | "updatedAt">
  ): Promise<TeamRole> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("team_roles")
      .insert({
        team_id: role.teamId,
        name: role.name,
        color: role.color,
        permissions: role.permissions,
        description: role.description,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return new TeamRole({
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      color: data.color,
      permissions: data.permissions as string[],
      teamId: data.team_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at || data.created_at),
    });
  }

  async updateTeamRole(
    roleId: string,
    teamId: string,
    data: Partial<TeamRoleProps>
  ): Promise<TeamRole> {
    const updateData: Partial<
      Database["public"]["Tables"]["team_roles"]["Update"]
    > = {
      name: data.name,
      color: data.color,
      permissions: data.permissions,
      description: data.description,
    };
    const supabase = getSupabaseClient();
    const { data: updated, error } = await supabase
      .from("team_roles")
      .update(updateData)
      .eq("id", roleId)
      .eq("team_id", teamId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return new TeamRole({
      id: updated.id,
      name: updated.name,
      description: updated.description || undefined,
      color: updated.color,
      permissions: updated.permissions as string[],
      teamId: updated.team_id,
      createdAt: new Date(updated.created_at),
      updatedAt: new Date(updated.updated_at || updated.created_at),
    });
  }

  async deleteTeamRole(roleId: string, teamId: string): Promise<void> {

    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("team_roles")
      .delete()
      .eq("id", roleId)
      .eq("team_id", teamId);

    if (error) throw new Error(error.message);
  }

  async getTeamInvites(teamId: string): Promise<TeamInvite[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("team_invites")
      .select("*")
      .eq("team_id", teamId)
      .eq("status", "pending");

    if (error) throw new Error(error.message);

    return (data || []).map(
      (item) =>
        new TeamInvite({
          id: item.id,
          email: item.email,
          status: item.status as any,
          teamId: item.team_id!,
          roleId: item.role_id,
          invitedBy: item.invited_by!,
          createdBy: item.invited_by!,
          createdAt: new Date(item.created_at),
        })
    );
  }

  async createTeamInvite(
    invite: Omit<TeamInviteProps, "id" | "createdAt">
  ): Promise<TeamInvite> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("team_invites")
      .insert({
        team_id: invite.teamId,
        email: invite.email.toLowerCase(),
        invited_by: invite.invitedBy,
        status: invite.status,
        role_id: invite.roleId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return new TeamInvite({
      id: data.id,
      email: data.email,
      status: data.status as any,
      teamId: data.team_id!,
      roleId: data.role_id,
      invitedBy: data.invited_by!,
      createdBy: data.invited_by!,
      createdAt: new Date(data.created_at),
    });
  }

  async deleteTeamInvite(inviteId: string, teamId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("team_invites")
      .delete()
      .eq("id", inviteId)
      .eq("team_id", teamId);

    if (error) throw new Error(error.message);
  }
}
