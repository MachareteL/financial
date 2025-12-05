import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import { Team } from "@/domain/entities/team";
import { TeamRole, type TeamRoleProps } from "@/domain/entities/team-role";
import {
  TeamInvite,
  type TeamInviteProps,
} from "@/domain/entities/team-invite";
import type {
  TeamMemberProfileDTO,
  TeamInviteDetailsDTO,
} from "@/domain/dto/team.types.d.ts";
import type { Database } from "@/domain/dto/database.types.d.ts";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { MemberWithRole } from "@/domain/dto/supabase-joins.types";

export class TeamRepository implements ITeamRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async createTeam(
    teamName: string,
    createdBy: string,
    trialEndsAt?: Date
  ): Promise<Team> {
    const { data: teamData, error: teamError } = await this.supabase
      .from("teams")
      .insert({
        name: teamName,
        created_by: createdBy,
        trial_ends_at: trialEndsAt ? trialEndsAt.toISOString() : null,
      })
      .select()
      .single();

    if (teamError) throw new Error(teamError.message);

    const allPermissions = [
      "MANAGE_EXPENSES",
      "MANAGE_BUDGET",
      "MANAGE_INVESTMENTS",
      "MANAGE_TEAM",
    ];

    const ownerRoleData: Database["public"]["Tables"]["team_roles"]["Insert"] =
      {
        team_id: teamData.id,
        name: "Proprietário",
        color: "#eab308",
        permissions: allPermissions,
        description: "Dono do time. Acesso total e irrestrito.",
      };

    const { data: ownerRole, error: ownerError } = await this.supabase
      .from("team_roles")
      .insert(ownerRoleData)
      .select("id")
      .single();

    if (ownerError) throw new Error(ownerError.message);

    const { error: memberError } = await this.supabase
      .from("team_members")
      .insert({
        team_id: teamData.id,
        profile_id: createdBy,
        role_id: ownerRole.id,
      });

    if (memberError) throw new Error(memberError.message);

    return new Team({
      id: teamData.id,
      name: teamData.name,
      createdAt: new Date(teamData.created_at),
      createdBy: teamData.created_by!,
      trialEndsAt: teamData.trial_ends_at
        ? new Date(teamData.trial_ends_at)
        : undefined,
    });
  }

  async updateTeam(teamId: string, name: string): Promise<void> {
    const { error } = await this.supabase
      .from("teams")
      .update({ name })
      .eq("id", teamId);

    if (error) throw new Error(error.message);
  }

  async countTeamsByOwner(userId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from("teams")
      .select("*", { count: "exact", head: true })
      .eq("created_by", userId);

    if (error) throw new Error(error.message);
    return count || 0;
  }

  async getTeamsByOwner(userId: string): Promise<Team[]> {
    const { data, error } = await this.supabase
      .from("teams")
      .select("*")
      .eq("created_by", userId);

    if (error) throw new Error(error.message);

    return (data || []).map(
      (item) =>
        new Team({
          id: item.id,
          name: item.name,
          createdAt: new Date(item.created_at),
          createdBy: item.created_by!,
          trialEndsAt: item.trial_ends_at
            ? new Date(item.trial_ends_at)
            : undefined,
        })
    );
  }

  async countMembersWithPermission(
    teamId: string,
    permission: string
  ): Promise<number> {
    const { data, error } = await this.supabase
      .from("team_members")
      .select("role_id, team_roles!inner(permissions)")
      .eq("team_id", teamId)
      .returns<MemberWithRole[]>();

    if (error) throw new Error(error.message);

    // Filter in memory
    const count = (data || []).filter((member) => {
      const perms = Array.isArray(member.team_roles)
        ? member.team_roles[0]?.permissions
        : member.team_roles?.permissions;

      return (perms || []).includes(permission);
    }).length;

    return count;
  }

  async getTeamById(teamId: string): Promise<Team | null> {
    const { data, error } = await this.supabase
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

  async getTeamMembers(teamId: string): Promise<TeamMemberProfileDTO[]> {
    const { data, error } = await this.supabase
      .from("team_members")
      .select(
        `
        profile_id,
        role_id,
        created_at,
        profiles (
          id,
          name,
          email,
          created_at
        ),
        team_roles (
          id,
          name,
          color,
          permissions
        )
      `
      )
      .eq("team_id", teamId)
      .returns<MemberWithRole[]>();

    if (error) throw new Error(error.message);

    return (data || []).map((item) => {
      const profile = Array.isArray(item.profiles)
        ? item.profiles[0]
        : item.profiles;
      const role = Array.isArray(item.team_roles)
        ? item.team_roles[0]
        : item.team_roles;

      return {
        id: item.profile_id, // This should be the profile's ID
        name: profile?.name || "",
        email: profile?.email || "",
        createdAt: profile?.created_at || "",
        roleId: item.role_id,
        teamRole: role
          ? {
              id: role.id || "",
              name: role.name,
              color: role.color || "",
              permissions: role.permissions || [],
            }
          : undefined,
      };
    });
  }

  async updateMemberRole(
    teamId: string,
    memberId: string, // This is profile_id
    roleId: string | null
  ): Promise<void> {
    if (!roleId) throw new Error("É necessário definir um cargo.");

    const { error } = await this.supabase
      .from("team_members")
      .update({ role_id: roleId })
      .eq("team_id", teamId)
      .eq("profile_id", memberId);

    if (error) throw new Error(error.message);
  }

  async removeMember(teamId: string, memberId: string): Promise<void> {
    const { error } = await this.supabase
      .from("team_members")
      .delete()
      .eq("team_id", teamId)
      .eq("profile_id", memberId);

    if (error) throw new Error(error.message);
  }

  async getTeamRoles(teamId: string): Promise<TeamRole[]> {
    const { data, error } = await this.supabase
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
    const { data: updated, error } = await this.supabase
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
    const { error } = await this.supabase
      .from("team_roles")
      .delete()
      .eq("id", roleId)
      .eq("team_id", teamId);

    if (error) throw new Error(error.message);
  }

  async getTeamInvites(teamId: string): Promise<TeamInvite[]> {
    const { data, error } = await this.supabase
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
          createdAt: new Date(item.created_at),
        })
    );
  }

  async createTeamInvite(
    invite: Omit<TeamInviteProps, "id" | "createdAt">
  ): Promise<TeamInvite> {
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

  async deleteTeamInvite(inviteId: string, teamId: string): Promise<void> {
    const { error } = await this.supabase
      .from("team_invites")
      .delete()
      .eq("id", inviteId)
      .eq("team_id", teamId);

    if (error) throw new Error(error.message);
  }

  async getPendingInvitesByEmail(
    email: string
  ): Promise<TeamInviteDetailsDTO[]> {
    const { data, error } = await this.supabase
      .from("team_invites")
      .select(
        `
        *,
        teams (name),
        invited_by_profile:invited_by (name),
        team_roles (name)
      `
      )
      .eq("email", email)
      .eq("status", "pending");

    if (error) throw new Error(error.message);

    const invites = (data || [])
      .map(
        (item) =>
          item as unknown as import("@/domain/dto/supabase-joins.types").TeamInviteWithDetails
      )
      .filter((item) => item.team_id !== null);

    return invites.map((item) => ({
      id: item.id,
      email: item.email,
      status: item.status as "pending" | "accepted" | "declined",
      teamId: item.team_id!,
      roleId: item.role_id,
      invitedBy: item.invited_by || "",
      createdAt: new Date(item.created_at),
      teamName: item.teams?.name || "",
      invitedByName: item.invited_by_profile?.name || "",
      roleName: item.team_roles?.name || "",
    }));
  }

  async acceptInvite(inviteId: string, userId: string): Promise<void> {
    // 1. Buscar convite
    const { data: invite, error: inviteError } = await this.supabase
      .from("team_invites")
      .select("*")
      .eq("id", inviteId)
      .single();

    if (inviteError || !invite) throw new Error("Convite não encontrado.");
    if (invite.status !== "pending") throw new Error("Convite inválido.");

    // 2. Inserir membro
    const { error: memberError } = await this.supabase
      .from("team_members")
      .insert({
        team_id: invite.team_id!,
        profile_id: userId,
        role_id: invite.role_id!, // role_id can be null in invite but required in member, assuming invite always has role_id if valid
      });

    if (memberError) throw new Error(memberError.message);

    // 3. Atualizar convite para aceito
    await this.supabase
      .from("team_invites")
      .update({ status: "accepted" })
      .eq("id", inviteId);
  }

  async declineInvite(inviteId: string): Promise<void> {
    const { error } = await this.supabase
      .from("team_invites")
      .update({ status: "declined" })
      .eq("id", inviteId);

    if (error) throw new Error(error.message);
  }

  async verifyPermission(
    userId: string,
    teamId: string,
    permission: string
  ): Promise<boolean> {
    // 1. Buscar o membro e seu cargo
    const { data: member, error } = await this.supabase
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

    if (error || !member) return false;

    const typedMember = member as unknown as MemberWithRole;

    if (!typedMember.team_roles) return false;

    const role = Array.isArray(typedMember.team_roles)
      ? typedMember.team_roles[0]
      : typedMember.team_roles;

    const roleName = role?.name;
    const permissions = (role?.permissions as string[]) || [];

    // 2. Verificar Super Admin / Owner
    if (
      roleName === "Proprietário" ||
      roleName === "Owner" ||
      roleName === "Administrador"
    ) {
      return true;
    }

    // 3. Verificar permissão específica
    return permissions.includes(permission);
  }
}
