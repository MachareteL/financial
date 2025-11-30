import type { Team } from "@/domain/entities/team";
import type { TeamRole } from "@/domain/entities/team-role";
import type { TeamInvite } from "@/domain/entities/team-invite";
import type { Subscription } from "@/domain/entities/subscription";

export interface TeamMemberProfileDTO {
  id: string;
  name: string;
  email: string;
  roleId: string | null;
  createdAt: string; // ISO string

  teamRole?: {
    id: string;
    name: string;
    color: string;
  };
}

export interface CreateTeamRoleDTO {
  teamId: string;
  userId: string;
  name: string;
  color: string;
  permissions: string[];
}

export interface UpdateTeamRoleDTO {
  roleId: string;
  teamId: string;
  userId: string;
  name: string;
  color: string;
  permissions: string[];
}

export interface InviteMemberDTO {
  teamId: string;
  email: string;
  roleId: string | null;
  invitedBy: string;
}

export interface UpdateMemberRoleDTO {
  teamId: string;
  memberId: string;
  userId: string;
  roleId: string | null;
}

export interface CreateTeamDTO {
  teamName: string;
  userId: string;
}
export type TeamInviteDetailsDTO = {
  id: string;
  email: string;
  status: "pending" | "accepted" | "declined";
  teamId: string;
  roleId: string | null;
  invitedBy: string;
  createdAt: Date;
  teamName?: string;
  invitedByName?: string;
  roleName?: string;
};

export interface TeamDataDTO {
  team: Team | null;
  members: TeamMemberProfileDTO[];
  roles: TeamRole[];
  invites: TeamInvite[];
  subscription: Subscription | null;
}
