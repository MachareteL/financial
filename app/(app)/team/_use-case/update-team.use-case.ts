import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";

export class UpdateTeamUseCase {
  constructor(private teamRepository: ITeamRepository) {}

  async execute(teamId: string, name: string): Promise<void> {
    if (!teamId) throw new Error("ID do time é obrigatório.");
    if (!name || name.trim().length < 3) {
      throw new Error("O nome do time deve ter pelo menos 3 caracteres.");
    }

    await this.teamRepository.updateTeam(teamId, name.trim());
  }
}
