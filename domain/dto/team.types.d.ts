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
  }
}

export interface CreateTeamRoleDTO {
  teamId: string;
  name: string;
  color: string;
  permissions: string[];
}

export interface UpdateTeamRoleDTO {
  roleId: string;
  teamId: string;
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
  roleId: string | null;
}