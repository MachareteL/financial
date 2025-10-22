import type { IExpenseRepository } from "@/domain/IRepositories/expense.repository.interface"

export interface GetMonthlyExpensesInput {
  familyId: string
  month: number
  year: number
}

export interface MonthlyExpensesOutput {
  necessidades: number
  desejos: number
  poupanca: number
  total: number
}

export class GetMonthlyExpensesUseCase {
  constructor(private expenseRepository: IExpenseRepository) {}

  async execute(input: GetMonthlyExpensesInput): Promise<MonthlyExpensesOutput> {
    const startDate = new Date(input.year, input.month - 1, 1)
    const endDate = new Date(input.year, input.month, 0)

    const expenses = await this.expenseRepository.getExpensesByDateRange(input.familyId, startDate, endDate)

    const totals = {
      necessidades: 0,
      desejos: 0,
      poupanca: 0,
      total: 0,
    }

    expenses.forEach((expense) => {
      const classification = expense.category.classification
      totals[classification] += expense.amount
      totals.total += expense.amount
    })

    return totals
  }
}
