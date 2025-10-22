export interface IAuthRepository {
  signUp(email: string, password: string): Promise<{ userId: string; email: string }>
  signIn(email: string, password: string): Promise<{ userId: string; email: string }>
  signOut(): Promise<void>
  getCurrentAuthUser(): Promise<{ userId: string; email: string } | null>
}
