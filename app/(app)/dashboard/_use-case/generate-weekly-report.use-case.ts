import type { IExpenseRepository } from "@/domain/interfaces/expense.repository.interface";
import type { IAiService } from "@/domain/interfaces/ai-service.interface";
import type { IInsightRepository } from "@/domain/interfaces/insight.repository.interface";
import { Insight } from "@/domain/entities/insight";

export class GenerateWeeklyReportUseCase {
  constructor(
    private expenseRepository: IExpenseRepository,
    private aiService: IAiService,
    private insightRepository: IInsightRepository
  ) {}

  async execute(teamId: string): Promise<void> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    const expenses = await this.expenseRepository.findByDateRange(
      teamId,
      startDate,
      endDate
    );

    const content = await this.aiService.generateWeeklyInsight(expenses);

    const insight = new Insight({
      id: crypto.randomUUID(),
      teamId, // Changed from userId
      type: "WEEKLY_REPORT",
      title: "Resumo Semanal",
      content,
      isRead: false,
      createdAt: new Date(),
    });

    await this.insightRepository.create(insight);
  }
}
