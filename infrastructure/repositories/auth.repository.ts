import type { IAuthRepository } from "@/domain/interfaces/auth.repository"
import type { User } from "@/domain/entities/user"
import { getSupabaseClient } from "../database/supabase.client"

export class AuthSupabaseRepository implements IAuthRepository {
  async getCurrentAuthUser(): Promise<User | null> {
    const supabase = getSupabaseClient()
    const { data } = await supabase.auth.getSession()
    if (!data.session?.user) return null
    return { id: data.session.user.id, email: data.session.user.email!, name: data.session.user.user_metadata?.name || "" }
  }

  async signUp(email: string, password: string, name: string): Promise<User> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } } // metadata
    })
    if (error || !data.user) throw error
    return { id: data.user.id, email: data.user.email!, name }
  }

  async signIn(email: string, password: string): Promise<User> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) throw error
    return { id: data.user.id, email: data.user.email!, name: data.user.user_metadata?.name || "" }
  }

  async signOut(): Promise<void> {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
  }
}
