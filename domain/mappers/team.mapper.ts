import { DateUtils } from "@/domain/utils/date.utils";
import { Team } from "../entities/team";
import type { TeamDTO } from "../dto/team.types.d.ts";
import type { Database } from "../dto/database.types.d.ts";
import { Mapper } from "../interfaces/mapper.interface";

type TeamRow = Database["public"]["Tables"]["teams"]["Row"];

export class TeamMapperImplementation implements Mapper<Team, TeamDTO> {
  toDomain(raw: TeamRow): Team {
    return new Team({
      id: raw.id,
      name: raw.name,
      createdBy: raw.created_by || "", // Handle null if needed, though schema says string | null
      createdAt: DateUtils.parse(raw.created_at) || DateUtils.now(),
      trialEndsAt: DateUtils.parse(raw.trial_ends_at),
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
