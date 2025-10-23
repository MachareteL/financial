import type { IBudgetRepository } from "@/domain/interfaces/budget.repository.interface"
import type { BudgetSummary } from "@/domain/entities/budget"

export interface GetBudgetSummaryDTO {
  familyId: string
  month: number
  year: number
}

export class GetBudgetSummaryUseCase {
  constructor(private budgetRepository: IBudgetRepository) {}

  async execute(dto: GetBudgetSummaryDTO): Promise<BudgetSummary | null> {
    return await this.budgetRepository.getBudgetSummary(dto.familyId, dto.month, dto.year)
  }
}
