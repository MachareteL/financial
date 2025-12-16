import { DateUtils } from "@/domain/utils/date.utils";
import { Team } from "../entities/team";
import type { TeamDTO } from "../dto/team.types.d.ts";
import { Mapper } from "../interfaces/mapper.interface";

export class TeamMapperImplementation implements Mapper<Team, TeamDTO> {
  toDomain(raw: any): Team {
    return new Team({
      id: raw.id,
      name: raw.name,
      createdBy: raw.createdBy,
      createdAt: DateUtils.parse(raw.createdAt) || DateUtils.now(),
      trialEndsAt: DateUtils.parse(raw.trialEndsAt),
    });
  }

  toDTO(t: Team): TeamDTO {
    return {
      id: t.id,
      name: t.name,
      createdBy: t.createdBy,
      createdAt: t.createdAt,
      trialEndsAt: t.trialEndsAt,
    };
  }
}

export const TeamMapper = new TeamMapperImplementation();
