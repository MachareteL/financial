import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import type { InviteMemberDTO, UpdateMemberRoleDTO } from "@/domain/dto/team.types.d.ts";
import type { TeamInvite } from "@/domain/entities/team-invite";

export class ManageMembersUseCase {
  constructor(private teamRepository: ITeamRepository) {}

  async inviteMember(dto: InviteMemberDTO): Promise<TeamInvite> {
    return await this.teamRepository.createTeamInvite({
      teamId: dto.teamId,
      email: dto.email,
      roleId: dto.roleId,
      invitedBy: dto.invitedBy,
      createdBy: dto.invitedBy,
      status: 'pending'
    });
  }

  async updateMemberRole(dto: UpdateMemberRoleDTO): Promise<void> {
    await this.teamRepository.updateMemberRole(dto.teamId, dto.memberId, dto.roleId);
  }
  
  async removeMember(teamId: string, memberId: string): Promise<void> {
    await this.teamRepository.removeMember(teamId, memberId);
  }
  
  async cancelInvite(inviteId: string, teamId: string): Promise<void> {
    await this.teamRepository.deleteTeamInvite(inviteId, teamId);
  }
}