import { DateUtils } from "@/domain/utils/date.utils";
import { TeamRole } from "../entities/team-role";
import type { TeamRoleDTO } from "../dto/team.types.d.ts";
import { Mapper } from "../interfaces/mapper.interface";

export class TeamRoleMapperImplementation implements Mapper<
  TeamRole,
  TeamRoleDTO
> {
  toDomain(raw: any): TeamRole {
    return new TeamRole({
      id: raw.id,
      name: raw.name,
      color: raw.color,
      permissions: raw.permissions,
      teamId: raw.teamId,
      createdAt: DateUtils.parse(raw.createdAt) || DateUtils.now(),
      updatedAt: DateUtils.parse(raw.updatedAt) || DateUtils.now(),
      description: raw.description,
    });
  }

  toDTO(t: TeamRole): TeamRoleDTO {
    return {
      id: t.id,
      name: t.name,
      color: t.color,
      permissions: t.permissions,
      teamId: t.teamId,
    };
  }
}

export const TeamRoleMapper = new TeamRoleMapperImplementation();
