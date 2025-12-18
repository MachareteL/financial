import { DateUtils } from "@/domain/utils/date.utils";
import { TeamRole } from "../entities/team-role";
import type { TeamRoleDTO } from "../dto/team.types.d.ts";
import type { Database } from "../dto/database.types.d.ts";
import { Mapper } from "../interfaces/mapper.interface";

type TeamRoleRow = Database["public"]["Tables"]["team_roles"]["Row"];

export class TeamRoleMapperImplementation implements Mapper<
  TeamRole,
  TeamRoleDTO
> {
  toDomain(raw: TeamRoleRow): TeamRole {
    return new TeamRole({
      id: raw.id,
      name: raw.name,
      color: raw.color,
      permissions: raw.permissions,
      teamId: raw.team_id,
      createdAt: DateUtils.parse(raw.created_at) || DateUtils.now(),
      updatedAt: DateUtils.parse(raw.updated_at) || DateUtils.now(),
      description: raw.description!,
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
