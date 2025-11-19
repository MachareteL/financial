import type { IAuthRepository } from "@/domain/interfaces/auth.repository.interface"
import type { UserSession, TeamMembership } from "@/domain/dto/user.types.d.ts"
import { User } from "@/domain/entities/user"
import { Team } from "@/domain/entities/team"
import { getSupabaseClient } from "../database/supabase.client"

export class AuthSupabaseRepository implements IAuthRepository {
  private async getProfileAndTeams(userId: string): Promise<UserSession | null> {
    const supabase = getSupabaseClient()
    
    const { data: profile, error } = await supabase
      .from("profiles")
      .select(`
        id, email, name, created_at,
        team_members (
          team_id,
          role_id,
          teams (
            id,
            name,
            created_at,
            created_by
          ),
          team_roles (
            name,
            permissions
          )
        )
      `)
      .eq("id", userId)
      .single()

    if (error) throw error
    if (!profile) return null

    const user = new User({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      createdAt: new Date(profile.created_at),
    });

    const teams: TeamMembership[] = profile.team_members.map((membership) => ({
      team: new Team({
        id: membership.teams.id,
        name: membership.teams.name,
        createdAt: new Date(membership.teams.created_at),
        createdBy: membership.teams.created_by!
      }),
      role: membership.team_roles.name,
      permissions: membership.team_roles.permissions || [],
    }));

    return {
      user: user,
      teams: teams,
    }
  }

  async getCurrentAuthUser(): Promise<UserSession | null> {
    const supabase = getSupabaseClient()
    const { data } = await supabase.auth.getSession()
    if (!data.session?.user) return null

    return await this.getProfileAndTeams(data.session.user.id)
  }

  async signIn(email: string, password: string): Promise<UserSession> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) throw error

    const session = await this.getProfileAndTeams(data.user.id)
    if (!session) throw new Error("Usuário autenticado mas perfil não encontrado.")
    
    return session
  }

  async signUp(email: string, password: string, name: string): Promise<User> {
    const supabase = getSupabaseClient()
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    })
    if (authError || !authData.user) throw authError || new Error("Falha no cadastro")

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authData.user.id,
        email: authData.user.email!,
        name: name,
      })
      .select()
      .single()
    if (profileError || !profile) throw profileError || new Error("Falha ao criar perfil")

    return new User({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      createdAt: new Date(profile.created_at),
    })
  }

  async signOut(): Promise<void> {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
  }
}