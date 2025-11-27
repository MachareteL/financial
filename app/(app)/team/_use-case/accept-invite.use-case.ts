import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";

export class AcceptInviteUseCase {
  constructor(private teamRepository: ITeamRepository) {}

  async execute(inviteId: string, userId: string): Promise<void> {
    if (!inviteId) throw new Error("ID do convite é obrigatório.");
    if (!userId) throw new Error("ID do usuário é obrigatório.");

    await this.teamRepository.acceptInvite(inviteId, userId);
  }
}
