import type { User } from "../entities/user"
import type { UserSession } from "../dto/user.types"
export interface IAuthRepository {
  getCurrentAuthUser(): Promise<UserSession | null>
  signIn(email: string, password: string): Promise<UserSession>
  signOut(): Promise<void>
  signUp(email: string, password: string, name: string): Promise<User>
}
