import type { IBudgetRepository } from "@/domain/interfaces/budget.repository"
import { Budget } from "@/domain/entities/budget"

export interface SaveBudgetInput {
  familyId: string
  month: number
  year: number
  totalIncome: number
}

export class SaveBudgetUseCase {
  constructor(private budgetRepository: IBudgetRepository) {}

  async execute(input: SaveBudgetInput): Promise<void> {
    // Calculate budget based on 50/30/20 rule
    const necessidadesBudget = input.totalIncome * 0.5
    const desejosBudget = input.totalIncome * 0.3
    const poupancaBudget = input.totalIncome * 0.2

    const existingBudget = await this.budgetRepository.findByFamilyAndPeriod(input.familyId, input.month, input.year)

    if (existingBudget) {
      existingBudget.totalIncome = input.totalIncome
      existingBudget.necessidadesBudget = necessidadesBudget
      existingBudget.desejosBudget = desejosBudget
      existingBudget.poupancaBudget = poupancaBudget

      await this.budgetRepository.update(existingBudget)
    } else {
      const budget = new Budget(
        crypto.randomUUID(),
        input.month,
        input.year,
        input.totalIncome,
        necessidadesBudget,
        desejosBudget,
        poupancaBudget,
        input.familyId,
      )

      await this.budgetRepository.create(budget)
    }
  }
}
