import { getSupabaseClient } from "@/infrastructure/database/supabase.client"
import {
  signUpUseCase,
  signInUseCase,
  signOutUseCase,
  getCurrentUserUseCase,
  createFamilyUseCase,
} from "@/application/services/dependency-injection"

export async function signUp(email: string, password: string, name: string) {
  return await signUpUseCase.execute({ email, password, name })
}

export async function signIn(email: string, password: string) {
  return await signInUseCase.execute({ email, password })
}

export async function signOut() {
  await signOutUseCase.execute()
}

export async function getCurrentUser() {
  const supabase = getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile() {
  return await getCurrentUserUseCase.execute()
}

export async function createFamily(familyName: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Usuário não autenticado")

  return await createFamilyUseCase.execute({
    familyName,
    userId: user.id,
  })
}

export function useAuthStateChange(callback: (user: any) => void) {
  const supabase = getSupabaseClient()
  supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null)
  })
}
