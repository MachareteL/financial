import type { IInsightRepository } from "@/domain/interfaces/insight.repository.interface";
import type { InsightDTO } from "@/domain/dto/insight.types.d.ts";
import { InsightMapper } from "@/domain/mappers/insight.mapper";

export class GetPendingInsightsUseCase {
  constructor(private insightRepository: IInsightRepository) {}

  async execute(teamId: string): Promise<InsightDTO[]> {
    const insights = await this.insightRepository.findPendingByTeamId(teamId);
    return insights.map(InsightMapper.toDTO);
  }
}
