import type { IUserRepository } from "@/domain/IRepositories/user.repository.interface"
import type { User, UserProfile, Family } from "@/domain/Entities/user.entity"
import { getSupabaseClient } from "../database/supabase.client"

export class UserRepository implements IUserRepository {
  private supabase = getSupabaseClient()

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await this.supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

    if (!profile) return null

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      familyId: profile.family_id,
      createdAt: new Date(profile.created_at),
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data: profile, error: profileError } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()

    if (profileError || !profile) return null

    let family: Family | null = null
    if (profile.family_id) {
      const { data: familyData } = await this.supabase
        .from("families")
        .select("*")
        .eq("id", profile.family_id)
        .maybeSingle()

      if (familyData) {
        family = {
          id: familyData.id,
          name: familyData.name,
          createdAt: new Date(familyData.created_at),
        }
      }
    }

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      familyId: profile.family_id,
      createdAt: new Date(profile.created_at),
      family,
    }
  }

  async createProfile(user: Omit<User, "createdAt">): Promise<User> {
    const { data, error } = await this.supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email,
        name: user.name,
        family_id: user.familyId,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      familyId: data.family_id,
      createdAt: new Date(data.created_at),
    }
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.email !== undefined) updateData.email = data.email
    if (data.familyId !== undefined) updateData.family_id = data.familyId

    const { data: updated, error } = await this.supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single()

    if (error) throw new Error(error.message)

    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      familyId: updated.family_id,
      createdAt: new Date(updated.created_at),
    }
  }

  async createFamily(familyName: string, userId: string): Promise<Family> {
    const familyId = crypto.randomUUID()

    const { error: familyError } = await this.supabase.from("families").insert({
      id: familyId,
      name: familyName,
    })

    if (familyError) throw new Error(familyError.message)

    const { error: profileError } = await this.supabase
      .from("profiles")
      .update({ family_id: familyId })
      .eq("id", userId)

    if (profileError) throw new Error(profileError.message)

    const { data: family } = await this.supabase.from("families").select("*").eq("id", familyId).single()

    return {
      id: family.id,
      name: family.name,
      createdAt: new Date(family.created_at),
    }
  }

  async getFamily(familyId: string): Promise<Family | null> {
    const { data, error } = await this.supabase.from("families").select("*").eq("id", familyId).maybeSingle()

    if (error || !data) return null

    return {
      id: data.id,
      name: data.name,
      createdAt: new Date(data.created_at),
    }
  }
}
