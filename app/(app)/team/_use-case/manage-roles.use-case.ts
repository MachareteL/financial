import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import type { CreateTeamRoleDTO, UpdateTeamRoleDTO } from "@/domain/dto/team.types.d.ts";
import type { TeamRole } from "@/domain/entities/team-role";

export class ManageRolesUseCase {
  constructor(private teamRepository: ITeamRepository) {}

  async createRole(dto: CreateTeamRoleDTO): Promise<TeamRole> {
    return await this.teamRepository.createTeamRole({
      teamId: dto.teamId,
      name: dto.name,
      color: dto.color,
      permissions: dto.permissions,
    });
  }

  async updateRole(dto: UpdateTeamRoleDTO): Promise<TeamRole> {
    return await this.teamRepository.updateTeamRole(dto.roleId, dto.teamId, {
      name: dto.name,
      color: dto.color,
      permissions: dto.permissions,
    });
  }

  async deleteRole(roleId: string, teamId: string): Promise<void> {
    await this.teamRepository.deleteTeamRole(roleId, teamId);
  }
}