import type { IBudgetRepository } from '@/domain/interfaces/budget.repository.interface'
import type { BudgetDetailsDTO } from '@/domain/dto/budget.types.d.ts'

export interface GetBudgetDTO {
  teamId: string
  month: number
  year: number
}

export class GetBudgetUseCase {
  constructor(private budgetRepository: IBudgetRepository) {}

  async execute(dto: GetBudgetDTO): Promise<BudgetDetailsDTO | null> {
    const budget = await this.budgetRepository.findByTeamAndPeriod(
      dto.teamId,
      dto.month,
      dto.year,
    )

    if (!budget) {
      return null
    }

    return {
      id: budget.id,
      month: budget.month,
      year: budget.year,
      totalIncome: budget.totalIncome,
    }
  }
}