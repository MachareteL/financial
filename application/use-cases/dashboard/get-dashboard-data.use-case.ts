import type { IExpenseRepository } from "@/domain/repositories/expense.repository.interface"
import type { IIncomeRepository } from "@/domain/repositories/income.repository"

export interface DashboardData {
  expenses: Array<{
    category: string
    amount: number
    classification: string
  }>
  monthlyData: {
    necessidades: number
    desejos: number
    poupanca: number
    total: number
  }
  monthlyIncome: number
}

export class GetDashboardDataUseCase {
  constructor(
    private expenseRepository: IExpenseRepository,
    private incomeRepository: IIncomeRepository,
  ) {}

  async execute(familyId: string, month: number, year: number): Promise<DashboardData> {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    // Get expenses for the month
    const expenses = await this.expenseRepository.getExpensesByDateRange(familyId, startDate, endDate)

    // Get all incomes for the family
    const allIncomes = await this.incomeRepository.getIncomes(familyId)

    // Calculate monthly income
    const monthlyIncome = this.calculateMonthlyIncome(allIncomes, month, year)

    // Process expenses by category and classification
    const categoryTotals: { [key: string]: { amount: number; classification: string } } = {}
    const classificationTotals = { necessidades: 0, desejos: 0, poupanca: 0, total: 0 }

    expenses.forEach((expense) => {
      const categoryName = expense.category?.name || "Sem categoria"
      const classification = expense.category?.classification || "necessidades"
      const amount = expense.amount

      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = { amount: 0, classification }
      }
      categoryTotals[categoryName].amount += amount
      classificationTotals[classification as keyof typeof classificationTotals] += amount
      classificationTotals.total += amount
    })

    const expenseData = Object.entries(categoryTotals).map(([category, data]) => ({
      category,
      amount: data.amount,
      classification: data.classification,
    }))

    return {
      expenses: expenseData,
      monthlyData: classificationTotals,
      monthlyIncome,
    }
  }

  private calculateMonthlyIncome(incomes: any[], month: number, year: number): number {
    return incomes
      .filter((income) => {
        if (income.type === "one_time") {
          const incomeDate = new Date(income.date)
          return incomeDate.getMonth() + 1 === month && incomeDate.getFullYear() === year
        }
        return income.type === "recurring" && income.frequency === "monthly"
      })
      .reduce((total, income) => total + income.amount, 0)
  }
}
