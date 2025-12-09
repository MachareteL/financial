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
    if (!hasPermission)
      throw new Error("Você não tem permissão para gerenciar membros.");

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
    if (!hasPermission)
      throw new Error("Você não tem permissão para gerenciar membros.");

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
    if (!hasPermission)
      throw new Error("Você não tem permissão para gerenciar membros.");

    // 2. Verificar se o usuário a ser removido tem permissão de gerenciar o time (Admin/Owner)
    const hasManagePermission = await this.teamRepository.verifyPermission(
      memberId,
      teamId,
      "MANAGE_TEAM"
    );

    if (hasManagePermission) {
      const adminCount = await this.teamRepository.countMembersWithPermission(
        teamId,
        "MANAGE_TEAM"
      );
      if (adminCount <= 1) {
        throw new Error(
          "Você precisa promover outro membro a administrador antes de sair."
        );
      }
    }

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
    if (!hasPermission)
      throw new Error("Você não tem permissão para gerenciar membros.");

    await this.teamRepository.deleteTeamInvite(inviteId, teamId);
  }
}
