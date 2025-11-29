import type { User } from "../entities/user";
import type { Team } from "../entities/team";

import type { Subscription } from "../entities/subscription";

export type TeamMembership = {
  team: Team;
  role: string;
  permissions: string[];
  subscription: Subscription | null;
};

export type UserSession = {
  user: User;
  teams: TeamMembership[];
};
