import type { IFamilyRepository } from "@/domain/IRepositories/family.repository.interface"
import type { FamilyMember, FamilyRole, FamilyInvite } from "@/domain/Entities/family-member.entity"
import { getSupabaseClient } from "../database/supabase.client"

export class FamilyRepository implements IFamilyRepository {
  private supabase = getSupabaseClient()

  async getFamilyMembers(familyId: string): Promise<FamilyMember[]> {
    const { data, error } = await this.supabase.from("profiles").select("*").eq("family_id", familyId)

    if (error) throw new Error(error.message)

    return (data || []).map((item) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      familyId: item.family_id,
    }))
  }

  async getFamilyRoles(familyId: string): Promise<FamilyRole[]> {
    const { data, error } = await this.supabase.from("family_roles").select("*").eq("family_id", familyId)

    if (error) throw new Error(error.message)

    return (data || []).map((item) => ({
      id: item.id,
      familyId: item.family_id,
      userId: item.user_id,
      role: item.role,
      permissions: item.permissions || [],
      createdAt: new Date(item.created_at),
    }))
  }

  async createFamilyRole(role: Omit<FamilyRole, "id" | "createdAt">): Promise<FamilyRole> {
    const { data, error } = await this.supabase
      .from("family_roles")
      .insert({
        family_id: role.familyId,
        user_id: role.userId,
        role: role.role,
        permissions: role.permissions,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    return {
      id: data.id,
      familyId: data.family_id,
      userId: data.user_id,
      role: data.role,
      permissions: data.permissions || [],
      createdAt: new Date(data.created_at),
    }
  }

  async updateFamilyRole(roleId: string, familyId: string, data: Partial<FamilyRole>): Promise<FamilyRole> {
    const updateData: any = {}
    if (data.role !== undefined) updateData.role = data.role
    if (data.permissions !== undefined) updateData.permissions = data.permissions

    const { data: updated, error } = await this.supabase
      .from("family_roles")
      .update(updateData)
      .eq("id", roleId)
      .eq("family_id", familyId)
      .select()
      .single()

    if (error) throw new Error(error.message)

    return {
      id: updated.id,
      familyId: updated.family_id,
      userId: updated.user_id,
      role: updated.role,
      permissions: updated.permissions || [],
      createdAt: new Date(updated.created_at),
    }
  }

  async deleteFamilyRole(roleId: string, familyId: string): Promise<void> {
    const { error } = await this.supabase.from("family_roles").delete().eq("id", roleId).eq("family_id", familyId)

    if (error) throw new Error(error.message)
  }

  async getFamilyInvites(familyId: string): Promise<FamilyInvite[]> {
    const { data, error } = await this.supabase.from("family_invites").select("*").eq("family_id", familyId)

    if (error) throw new Error(error.message)

    return (data || []).map((item) => ({
      id: item.id,
      familyId: item.family_id,
      email: item.email,
      invitedBy: item.invited_by,
      status: item.status,
      createdAt: new Date(item.created_at),
    }))
  }

  async createFamilyInvite(invite: Omit<FamilyInvite, "id" | "createdAt">): Promise<FamilyInvite> {
    const { data, error } = await this.supabase
      .from("family_invites")
      .insert({
        family_id: invite.familyId,
        email: invite.email,
        invited_by: invite.invitedBy,
        status: invite.status,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    return {
      id: data.id,
      familyId: data.family_id,
      email: data.email,
      invitedBy: data.invited_by,
      status: data.status,
      createdAt: new Date(data.created_at),
    }
  }

  async updateFamilyInvite(inviteId: string, familyId: string, status: FamilyInvite["status"]): Promise<FamilyInvite> {
    const { data, error } = await this.supabase
      .from("family_invites")
      .update({ status })
      .eq("id", inviteId)
      .eq("family_id", familyId)
      .select()
      .single()

    if (error) throw new Error(error.message)

    return {
      id: data.id,
      familyId: data.family_id,
      email: data.email,
      invitedBy: data.invited_by,
      status: data.status,
      createdAt: new Date(data.created_at),
    }
  }
}
