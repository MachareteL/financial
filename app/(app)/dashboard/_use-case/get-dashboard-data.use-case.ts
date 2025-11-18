import type { IExpenseRepository } from '@/domain/interfaces/expense.repository.interface'
import type { IBudgetRepository } from '@/domain/interfaces/budget.repository.interface'
import type { IBudgetCategoryRepository } from '@/domain/interfaces/budget-category.repository.interface'
import type { DashboardDataDTO, DashboardFolderData, DashboardExpenseChartData } from '@/domain/dto/dashboard.types.d.ts'

export class GetDashboardDataUseCase {
  constructor(
    private expenseRepository: IExpenseRepository,
    private budgetRepository: IBudgetRepository,
    private budgetCategoryRepository: IBudgetCategoryRepository
  ) {}

  async execute(teamId: string, month: number, year: number): Promise<DashboardDataDTO> {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)

    const budget = await this.budgetRepository.findByTeamAndPeriod(teamId, month, year)
    const totalIncome = budget?.totalIncome ?? 0

    const budgetCategories = await this.budgetCategoryRepository.findByTeamId(teamId)

    const expenses = await this.expenseRepository.findByDateRange(teamId, startDate, endDate)

    const folderMap = new Map<string, DashboardFolderData>()
    const expenseChartMap = new Map<string, DashboardExpenseChartData>()
    let totalSpent = 0

    // Inicializa o mapa de "pastas"
    for (const bc of budgetCategories) {
      folderMap.set(bc.id, {
        id: bc.id,
        name: bc.name,
        percentage: bc.percentage,
        budgeted: totalIncome * bc.percentage,
        spent: 0,
      })
    }

    for (const expense of expenses) {
      totalSpent += expense.amount

      const budgetCatId = expense.category?.budgetCategoryId
      const categoryName = expense.category?.name || 'Sem Categoria'
      const budgetCatName = expense.category?.budgetCategory?.name || 'Sem Pasta'

      if (budgetCatId && folderMap.has(budgetCatId)) {
        const folder = folderMap.get(budgetCatId)!
        folder.spent += expense.amount
      }

      const chartEntry = expenseChartMap.get(categoryName)
      if (chartEntry) {
        chartEntry.amount += expense.amount
      } else {
        expenseChartMap.set(categoryName, {
          name: categoryName,
          amount: expense.amount,
          budCategoryName: budgetCatName,
        })
      }
    }

    return {
      totalIncome,
      totalSpent,
      folders: Array.from(folderMap.values()),
      expenseChartData: Array.from(expenseChartMap.values()),
    }
  }
}