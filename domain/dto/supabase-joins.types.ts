import { Database } from "./database.types";

export type TeamRoleRow = Database["public"]["Tables"]["team_roles"]["Row"];
export type TeamMemberRow = Database["public"]["Tables"]["team_members"]["Row"];
export type TeamRow = Database["public"]["Tables"]["teams"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type SubscriptionRow =
  Database["public"]["Tables"]["subscriptions"]["Row"];

export interface MemberWithRole extends TeamMemberRow {
  team_roles: Pick<TeamRoleRow, "name" | "permissions" | "color"> | null;
  profiles: Pick<ProfileRow, "name" | "email"> | null;
}

export interface TeamWithRoleAndMembers extends TeamRow {
  roles: TeamRoleRow[];
  team_roles: TeamRoleRow[];
  members: MemberWithRole[];
}

export interface ProfileWithTeams extends ProfileRow {
  team_members: (TeamMemberRow & {
    teams: TeamRow & {
      subscriptions: SubscriptionRow[];
    };
    team_roles: TeamRoleRow;
  })[];
}

export interface TeamMembershipWithDetails extends TeamMemberRow {
  teams: TeamRow & {
    roles: TeamRoleRow[];
    team_roles: TeamRoleRow[];
    members: (TeamMemberRow & {
      profiles: ProfileRow;
      team_roles: TeamRoleRow;
    })[];
  };
}

export interface UserProfileWithTeams extends ProfileRow {
  team_members: (TeamMemberRow & {
    teams: TeamRow & {
      subscriptions: SubscriptionRow[];
    };
    team_roles: Pick<TeamRoleRow, "name" | "permissions">;
  })[];
}

export type TeamInviteRow = Database["public"]["Tables"]["team_invites"]["Row"];

export interface TeamInviteWithDetails extends TeamInviteRow {
  teams: Pick<TeamRow, "name"> | null;
  invited_by_profile: Pick<ProfileRow, "name"> | null;
  team_roles: Pick<TeamRoleRow, "name"> | null;
}
