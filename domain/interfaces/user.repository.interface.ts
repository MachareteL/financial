import type { User, UserProfile, Family } from "../entities/user"

export interface IUserRepository {
  getCurrentUser(): Promise<User | null>
  getUserProfile(userId: string): Promise<UserProfile | null>
  createProfile(user: Omit<User, "createdAt">): Promise<User>
  updateProfile(userId: string, data: Partial<User>): Promise<User>
  createFamily(familyName: string, userId: string): Promise<Family>
  getFamily(familyId: string): Promise<Family | null>
}
