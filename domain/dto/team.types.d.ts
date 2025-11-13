
export interface TeamMemberProfileDTO {
  id: string;
  name: string;
  email: string;
  roleId: string | null;
  createdAt: string;
  
  teamRole?: {
    id: string;
    name: string;
    color: string;
  }
}

export interface TeamMemberDTO {
  profileId: string;
  teamId: string;
  roleId: string;
}