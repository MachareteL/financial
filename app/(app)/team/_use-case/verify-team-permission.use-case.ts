import { ITeamRepository } from "@/domain/interfaces/team.repository.interface";

export class VerifyTeamPermissionUseCase {
  constructor(private teamRepository: ITeamRepository) {}

  async execute(
    userId: string,
    teamId: string,
    permission: string
  ): Promise<boolean> {
    return this.teamRepository.verifyPermission(userId, teamId, permission);
  }
}
