// domain/interfaces/user.repository.interface.ts
import type { User, UserProfile } from "../entities/user" // Assumindo que UserProfile está em user.ts

export interface IUserRepository {
  getUserProfile(userId: string): Promise<UserProfile | null>
  createProfile(user: Omit<User, "createdAt">): Promise<User>
  updateProfile(userId: string, data: Partial<User>): Promise<User>
}