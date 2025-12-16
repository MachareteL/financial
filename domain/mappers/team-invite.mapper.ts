import { DateUtils } from "@/domain/utils/date.utils";
import { TeamInvite } from "../entities/team-invite";
import type { TeamInviteDTO } from "../dto/team.types.d.ts";
import { Mapper } from "../interfaces/mapper.interface";

export class TeamInviteMapperImplementation implements Mapper<
  TeamInvite,
  TeamInviteDTO
> {
  toDomain(raw: any): TeamInvite {
    return new TeamInvite({
      id: raw.id,
      email: raw.email,
      status: raw.status as any,
      teamId: raw.teamId,
      roleId: raw.roleId,
      invitedBy: raw.invitedBy,
      createdAt: DateUtils.parse(raw.createdAt) || DateUtils.now(),
    });
  }

  toDTO(t: TeamInvite): TeamInviteDTO {
    return {
      id: t.id,
      email: t.email,
      status: t.status,
      teamId: t.teamId,
      roleId: t.roleId,
      invitedBy: t.invitedBy,
      createdAt: t.createdAt,
    };
  }
}

export const TeamInviteMapper = new TeamInviteMapperImplementation();
