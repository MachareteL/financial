import type { IInsightRepository } from "@/domain/interfaces/insight.repository.interface";

export class MarkInsightAsReadUseCase {
  constructor(private insightRepository: IInsightRepository) {}

  async execute(insightId: string): Promise<void> {
    await this.insightRepository.markAsRead(insightId);
  }
}
