import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import type { GenerateWeeklyReportUseCase } from "./generate-weekly-report.use-case";

export class GenerateBatchWeeklyReportsUseCase {
  constructor(
    private teamRepository: ITeamRepository,
    private generateWeeklyReportUseCase: GenerateWeeklyReportUseCase
  ) {}

  async execute(): Promise<{ success: number; failed: number; errors: any[] }> {
    const teams = await this.teamRepository.getActiveTeams();
    let success = 0;
    let failed = 0;
    const errors: any[] = [];

    console.log(`[BatchReport] Starting generation for ${teams.length} teams.`);

    for (const team of teams) {
      try {
        await this.generateWeeklyReportUseCase.execute(team.id);
        success++;
      } catch (error) {
        console.error(`[BatchReport] Failed for team ${team.id}:`, error);
        failed++;
        errors.push({ teamId: team.id, error });
      }
    }

    return { success, failed, errors };
  }
}
