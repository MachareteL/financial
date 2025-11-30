import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";

import type { IAnalyticsService } from "@/domain/interfaces/analytics-service.interface";

export class AcceptInviteUseCase {
  constructor(
    private teamRepository: ITeamRepository,
    private analyticsService: IAnalyticsService
  ) {}

  async execute(inviteId: string, userId: string): Promise<void> {
    if (!inviteId) throw new Error("ID do convite é obrigatório.");
    if (!userId) throw new Error("ID do usuário é obrigatório.");

    const { teamId, teamName } = await this.teamRepository.acceptInvite(
      inviteId,
      userId
    );

    // Fire-and-forget analytics
    this.analyticsService.group("team", teamId, {
      name: teamName,
      created_by: userId,
    });
  }
}
