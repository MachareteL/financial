import type { IBudgetRepository } from "@/domain/interfaces/budget.repository"

export interface GetBudgetInput {
  familyId: string
  month: number
  year: number
}

export interface BudgetOutput {
  id: string
  month: number
  year: number
  necessidadesBudget: number
  desejosBudget: number
  poupancaBudget: number
  totalIncome: number
}

export class GetBudgetUseCase {
  constructor(private budgetRepository: IBudgetRepository) {}

  async execute(input: GetBudgetInput): Promise<BudgetOutput | null> {
    const budget = await this.budgetRepository.findByFamilyAndPeriod(input.familyId, input.month, input.year)

    if (!budget) {
      return null
    }

    return {
      id: budget.id,
      month: budget.month,
      year: budget.year,
      necessidadesBudget: budget.necessidadesBudget,
      desejosBudget: budget.desejosBudget,
      poupancaBudget: budget.poupancaBudget,
      totalIncome: budget.totalIncome,
    }
  }
}
