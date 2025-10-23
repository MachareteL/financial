import type { User } from "../entities/user"

export interface IAuthRepository {
  getCurrentAuthUser(): Promise<User | null>
  signIn(email: string, password: string): Promise<User>
  signOut(): Promise<void>
  signUp(email: string, password: string, name: string): Promise<User>
}
