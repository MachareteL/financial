import type { IAuthRepository } from "@/domain/IRepositories/IAuth.repository"
import { getSupabaseClient } from "../database/supabase.client"

export class AuthRepository implements IAuthRepository {
  private supabase = getSupabaseClient()

  async signUp(email: string, password: string): Promise<{ userId: string; email: string }> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw new Error(error.message)
    if (!data.user) throw new Error("Failed to create user")

    return {
      userId: data.user.id,
      email: data.user.email!,
    }
  }

  async signIn(email: string, password: string): Promise<{ userId: string; email: string }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw new Error(error.message)
    if (!data.user) throw new Error("Failed to sign in")

    return {
      userId: data.user.id,
      email: data.user.email!,
    }
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut()
    if (error) throw new Error(error.message)
  }

  async getCurrentAuthUser(): Promise<{ userId: string; email: string } | null> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()

    if (!user) return null

    return {
      userId: user.id,
      email: user.email!,
    }
  }
}
