import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";

export class DeclineInviteUseCase {
  constructor(private teamRepository: ITeamRepository) {}

  async execute(inviteId: string): Promise<void> {
    if (!inviteId) throw new Error("ID do convite é obrigatório.");

    await this.teamRepository.declineInvite(inviteId);
  }
}
