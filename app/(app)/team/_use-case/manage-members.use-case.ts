import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import type {
  InviteMemberDTO,
  UpdateMemberRoleDTO,
} from "@/domain/dto/team.types.d.ts";
import type { TeamInvite } from "@/domain/entities/team-invite";

export class ManageMembersUseCase {
  constructor(private teamRepository: ITeamRepository) {}

  async inviteMember(dto: InviteMemberDTO): Promise<TeamInvite> {
    const hasPermission = await this.teamRepository.verifyPermission(
      dto.invitedBy,
      dto.teamId,
      "MANAGE_TEAM"
    );
    if (!hasPermission) throw new Error("Permissão negada.");

    return await this.teamRepository.createTeamInvite({
      teamId: dto.teamId,
      email: dto.email,
      roleId: dto.roleId,
      invitedBy: dto.invitedBy,
      status: "pending",
    });
  }

  async updateMemberRole(dto: UpdateMemberRoleDTO): Promise<void> {
    const hasPermission = await this.teamRepository.verifyPermission(
      dto.userId,
      dto.teamId,
      "MANAGE_TEAM"
    );
    if (!hasPermission) throw new Error("Permissão negada.");

    await this.teamRepository.updateMemberRole(
      dto.teamId,
      dto.memberId,
      dto.roleId
    );
  }

  async removeMember(
    teamId: string,
    memberId: string,
    userId: string
  ): Promise<void> {
    const hasPermission = await this.teamRepository.verifyPermission(
      userId,
      teamId,
      "MANAGE_TEAM"
    );
    if (!hasPermission) throw new Error("Permissão negada.");

    await this.teamRepository.removeMember(teamId, memberId);
  }

  async cancelInvite(
    inviteId: string,
    teamId: string,
    userId: string
  ): Promise<void> {
    const hasPermission = await this.teamRepository.verifyPermission(
      userId,
      teamId,
      "MANAGE_TEAM"
    );
    if (!hasPermission) throw new Error("Permissão negada.");

    await this.teamRepository.deleteTeamInvite(inviteId, teamId);
  }
}
