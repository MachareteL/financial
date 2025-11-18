import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import type { TeamMemberProfileDTO } from "@/domain/dto/team.types.d.ts";
import type { TeamRole } from "@/domain/entities/team-role";
import type { TeamInvite } from "@/domain/entities/team-invite";

export class GetTeamDataUseCase {
  constructor(private teamRepository: ITeamRepository) {}

  async execute(teamId: string): Promise<{
    members: TeamMemberProfileDTO[];
    roles: TeamRole[];
    invites: TeamInvite[];
  }> {
    const [members, roles, invites] = await Promise.all([
      this.teamRepository.getTeamMembers(teamId),
      this.teamRepository.getTeamRoles(teamId),
      this.teamRepository.getTeamInvites(teamId),
    ]);

    return { members, roles, invites };
  }
}
