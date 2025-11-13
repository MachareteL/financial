// domain/interfaces/user.repository.interface.ts
import type { User, } from "../entities/user"
import type { Team } from "../entities/team" 
export interface IUserRepository {
  getCurrentUser(): Promise<User | null>
  createProfile(user: Omit<User, "createdAt">): Promise<User>
  updateProfile(userId: string, data: Partial<User>): Promise<User>

  createTeam(teamName: string, userId: string): Promise<Team>
  getTeam(teamId: string): Promise<Team | null>

  getTeamsForUser(userId: string): Promise<{ team: Team; role: string }[]>
}