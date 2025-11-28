import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import type {
  CreateTeamRoleDTO,
  UpdateTeamRoleDTO,
} from "@/domain/dto/team.types.d.ts";
import type { TeamRole } from "@/domain/entities/team-role";

export class ManageRolesUseCase {
  constructor(private teamRepository: ITeamRepository) {}

  async createRole(dto: CreateTeamRoleDTO): Promise<TeamRole> {
    const hasPermission = await this.teamRepository.verifyPermission(
      dto.userId,
      dto.teamId,
      "MANAGE_TEAM"
    );
    if (!hasPermission) throw new Error("Permissão negada.");

    return await this.teamRepository.createTeamRole({
      teamId: dto.teamId,
      name: dto.name,
      color: dto.color,
      permissions: dto.permissions,
    });
  }

  async updateRole(dto: UpdateTeamRoleDTO): Promise<TeamRole> {
    const hasPermission = await this.teamRepository.verifyPermission(
      dto.userId,
      dto.teamId,
      "MANAGE_TEAM"
    );
    if (!hasPermission) throw new Error("Permissão negada.");

    return await this.teamRepository.updateTeamRole(dto.roleId, dto.teamId, {
      name: dto.name,
      color: dto.color,
      permissions: dto.permissions,
    });
  }

  async deleteRole(
    roleId: string,
    teamId: string,
    userId: string
  ): Promise<void> {
    const hasPermission = await this.teamRepository.verifyPermission(
      userId,
      teamId,
      "MANAGE_TEAM"
    );
    if (!hasPermission) throw new Error("Permissão negada.");

    await this.teamRepository.deleteTeamRole(roleId, teamId);
  }
}
