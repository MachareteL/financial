import type { User } from "../entities/user"
import type { Team } from "../entities/team"

export type TeamMembership = {
  team: Team;
  role: string;
  permissions: string[];
};

export type UserSession = {
  user: User;
  teams: TeamMembership[];
};