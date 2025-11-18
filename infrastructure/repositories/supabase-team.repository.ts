import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface"; 

import { Team } from "@/domain/entities/team";
import { TeamRole, TeamRoleProps } from "@/domain/entities/team-role";
import { TeamInvite, TeamInviteProps } from "@/domain/entities/team-invite";
import type { TeamMemberProfileDTO } from "@/domain/dto/team.types.d.ts"; // DTO para a UI

import { getSupabaseClient } from "../database/supabase.client";
import type { Database } from "@/domain/dto/database.types.d.ts";

export class TeamRepository implements ITeamRepository {
  private supabase = getSupabaseClient();

  async createTeam(teamName: string, adminUserId: string): Promise<Team> {
    // 1. Criar o Time
    const { data: teamData, error: teamError } = await this.supabase
      .from("teams")
      .insert({ name: teamName })
      .select()
      .single();

    if (teamError) throw new Error(teamError.message);

    const adminRoleData: Database["public"]["Tables"]["team_roles"]["Insert"] = {
      team_id: teamData.id,
      name: "Administrador",
      color: "#ef4444",
      permissions: [
        "view_dashboard", "view_expenses", "create_expenses", "edit_expenses", "delete_expenses",
        "view_budget", "edit_budget", "view_investments", "edit_investments",
        "view_categories", "edit_categories", "manage_family", "manage_roles",
      ],
    };

    const { data: adminRole, error: roleError } = await this.supabase
      .from("team_roles")
      .insert(adminRoleData)
      .select("id")
      .single();

    if (roleError) {
      // Tentar reverter a criação do time se a criação do cargo falhar
      await this.supabase.from("teams").delete().eq("id", teamData.id);
      throw new Error(roleError.message);
    }

    // 3. Associar o usuário criador ao time como Admin
    const { error: memberError } = await this.supabase
      .from("team_members")
      .insert({
        profile_id: adminUserId,
        team_id: teamData.id,
        role_id: adminRole.id,
      });

    if (memberError) {
      // Tentar reverter
      await this.supabase.from("teams").delete().eq("id", teamData.id);
      throw new Error(memberError.message);
    }

    return new Team({
      id: teamData.id,
      name: teamData.name,
      createdAt: new Date(teamData.created_at),
    });
  }

  async getTeamMembers(teamId: string): Promise<TeamMemberProfileDTO[]> {
    const { data, error } = await this.supabase
      .from("team_members")
      .select(`
        role_id,
        profiles (id, name, email, created_at),
        team_roles (id, name, color)
      `)
      .eq("team_id", teamId);
      
    if (error) throw new Error(error.message);

    return (data || []).map((item: any) => ({
      id: item.profiles!.id,
      name: item.profiles!.name,
      email: item.profiles!.email,
      createdAt: item.profiles!.created_at,
      roleId: item.role_id,
      teamRole: item.team_roles ? {
        id: item.team_roles.id,
        name: item.team_roles.name,
        color: item.team_roles.color,
      } : undefined,
    }));
  }

  async getTeamRoles(teamId: string): Promise<TeamRole[]> {
    const { data, error } = await this.supabase.from("team_roles").select("*").eq("team_id", teamId);

    if (error) throw new Error(error.message);

    return (data || []).map((item) => new TeamRole({
      id: item.id,
      name: item.name,
      description: item.description || undefined,
      color: item.color,
      permissions: item.permissions,
      teamId: item.team_id,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at || item.created_at),
    }));
  }

  async createTeamRole(role: Omit<TeamRoleProps, "id" | "createdAt" | "updatedAt">): Promise<TeamRole> {
    const { data, error } = await this.supabase
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
      permissions: data.permissions,
      teamId: data.team_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at || data.created_at),
    });
  }

  async updateTeamRole(roleId: string, teamId: string, data: Partial<TeamRoleProps>): Promise<TeamRole> {
    // Mapear de camelCase (Props) para snake_case (DB)
    const updateData: Partial<Database["public"]["Tables"]["team_roles"]["Update"]> = {
      name: data.name,
      color: data.color,
      permissions: data.permissions,
      description: data.description,
    };
    
    const { data: updated, error } = await this.supabase
      .from("team_roles")
      .update(updateData)
      .eq("id", roleId)
      .eq("team_id", teamId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // FIX: Retornar instância da classe TeamRole
    return new TeamRole({
      id: updated.id,
      name: updated.name,
      description: updated.description || undefined,
      color: updated.color,
      permissions: updated.permissions,
      teamId: updated.team_id,
      createdAt: new Date(updated.created_at),
      updatedAt: new Date(updated.updated_at || updated.created_at),
    });
  }

  async deleteTeamRole(roleId: string, teamId: string): Promise<void> {
    const { error } = await this.supabase.from("team_roles").delete().eq("id", roleId).eq("team_id", teamId);
    if (error) throw new Error(error.message);
  }

  async getTeamInvites(teamId: string): Promise<TeamInvite[]> {
    const { data, error } = await this.supabase.from("team_invites").select("*").eq("team_id", teamId);

    if (error) throw new Error(error.message);


    return (data || []).map((item) => new TeamInvite({
      id: item.id,
      email: item.email,
      status: item.status as any, // Zod validará
      teamId: item.team_id!,
      roleId: item.role_id,
      invitedBy: item.invited_by!,
      createdAt: new Date(item.created_at),
    }));
  }

  async createTeamInvite(invite: Omit<TeamInviteProps, "id" | "createdAt">): Promise<TeamInvite> {
    const { data, error } = await this.supabase
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
      createdAt: new Date(data.created_at),
    });
  }

  async updateTeamInvite(inviteId: string, teamId: string, status: TeamInviteProps["status"]): Promise<TeamInvite> {
    const { data, error } = await this.supabase
      .from("team_invites")
      .update({ status })
      .eq("id", inviteId)
      .eq("team_id", teamId)
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
      createdAt: new Date(data.created_at),
    });
  }
}