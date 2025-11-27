import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import type { TeamInvite } from "@/domain/entities/team-invite";

export class GetPendingInvitesUseCase {
  constructor(private teamRepository: ITeamRepository) {}

  async execute(email: string): Promise<TeamInvite[]> {
    if (!email) throw new Error("Email é obrigatório.");
    return await this.teamRepository.getPendingInvitesByEmail(email);
  }
}
