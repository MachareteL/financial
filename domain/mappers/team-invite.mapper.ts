import { DateUtils } from "@/domain/utils/date.utils";
import { TeamInvite } from "../entities/team-invite";
import type { TeamInviteDTO } from "../dto/team.types.d.ts";
import type { Database } from "../dto/database.types.d.ts";
import { Mapper } from "../interfaces/mapper.interface";

type TeamInviteRow = Database["public"]["Tables"]["team_invites"]["Row"];

export class TeamInviteMapperImplementation implements Mapper<
  TeamInvite,
  TeamInviteDTO
> {
  toDomain(raw: TeamInviteRow): TeamInvite {
    return new TeamInvite({
      id: raw.id,
      email: raw.email,
      status: raw.status as "pending" | "accepted" | "declined",
      teamId: raw.team_id || "",
      roleId: raw.role_id || "",
      invitedBy: raw.invited_by || "",
      createdAt: DateUtils.parse(raw.created_at) || DateUtils.now(),
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
