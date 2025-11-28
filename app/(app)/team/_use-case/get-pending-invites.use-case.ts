import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import type { TeamInviteDetailsDTO } from "@/domain/dto/team.types.d.ts";

export class GetPendingInvitesUseCase {
  constructor(private teamRepository: ITeamRepository) {}

  async execute(email: string): Promise<TeamInviteDetailsDTO[]> {
    if (!email) throw new Error("Email é obrigatório.");
    return await this.teamRepository.getPendingInvitesByEmail(email);
  }
}
