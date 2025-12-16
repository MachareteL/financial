import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";

import type {
  TeamMemberProfileDTO,
  TeamDTO,
  TeamRoleDTO,
  TeamInviteDTO,
} from "@/domain/dto/team.types.d.ts";
import { TeamMapper } from "@/domain/mappers/team.mapper";
import { TeamRoleMapper } from "@/domain/mappers/team-role.mapper";
import { TeamInviteMapper } from "@/domain/mappers/team-invite.mapper";

import type { ISubscriptionRepository } from "@/domain/interfaces/subscription.repository.interface";
import type { SubscriptionDTO } from "@/domain/dto/subscription.types.d.ts";
import { SubscriptionMapper } from "@/domain/mappers/subscription.mapper";

export class GetTeamDataUseCase {
  constructor(
    private teamRepository: ITeamRepository,
    private subscriptionRepository?: ISubscriptionRepository
  ) {}

  async execute(teamId: string): Promise<{
    team: TeamDTO | null;
    members: TeamMemberProfileDTO[];
    roles: TeamRoleDTO[];
    invites: TeamInviteDTO[];
    subscription: SubscriptionDTO | null;
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

    return {
      team: team ? TeamMapper.toDTO(team) : null,
      members,
      roles: roles.map(TeamRoleMapper.toDTO),
      invites: invites.map(TeamInviteMapper.toDTO),
      subscription: subscription
        ? SubscriptionMapper.toDTO(subscription)
        : null,
    };
  }
}
