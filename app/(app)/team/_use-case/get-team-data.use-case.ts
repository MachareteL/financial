import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import type { TeamMemberProfileDTO } from "@/domain/dto/team.types.d.ts";
import type { TeamRole } from "@/domain/entities/team-role";
import type { TeamInvite } from "@/domain/entities/team-invite";

import type { ISubscriptionRepository } from "@/domain/interfaces/subscription.repository.interface";
import type { Subscription } from "@/domain/entities/subscription";

import type { Team } from "@/domain/entities/team";

export class GetTeamDataUseCase {
  constructor(
    private teamRepository: ITeamRepository,
    private subscriptionRepository?: ISubscriptionRepository
  ) {}

  async execute(teamId: string): Promise<{
    team: Team | null;
    members: TeamMemberProfileDTO[];
    roles: TeamRole[];
    invites: TeamInvite[];
    subscription: Subscription | null;
  }> {
    const [team, members, roles, invites, subscription] = await Promise.all([
      this.teamRepository.getTeamById(teamId),
      this.teamRepository.getTeamMembers(teamId),
      this.teamRepository.getTeamRoles(teamId),
      this.teamRepository.getTeamInvites(teamId),
      this.subscriptionRepository
        ? this.subscriptionRepository.findByTeamId(teamId)
        : Promise.resolve(null),
    ]);

    return { team, members, roles, invites, subscription };
  }
}
