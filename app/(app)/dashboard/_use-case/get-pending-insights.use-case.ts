import type { IInsightRepository } from "@/domain/interfaces/insight.repository.interface";
import type { Insight } from "@/domain/entities/insight";

export class GetPendingInsightsUseCase {
  constructor(private insightRepository: IInsightRepository) {}

  async execute(teamId: string): Promise<Insight[]> {
    return this.insightRepository.findPendingByTeamId(teamId);
  }
}
