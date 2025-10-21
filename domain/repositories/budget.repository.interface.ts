import type { Budget, Income, BudgetSummary } from "../entities/budget.entity"

export interface IBudgetRepository {
  getBudgetByMonthYear(familyId: string, month: number, year: number): Promise<Budget | null>
  createBudget(budget: Omit<Budget, "id" | "createdAt">): Promise<Budget>
  updateBudget(budgetId: string, familyId: string, data: Partial<Budget>): Promise<Budget>
  getIncomesByMonthYear(familyId: string, month: number, year: number): Promise<Income[]>
  createIncome(income: Omit<Income, "id" | "createdAt">): Promise<Income>
  updateIncome(incomeId: string, familyId: string, data: Partial<Income>): Promise<Income>
  deleteIncome(incomeId: string, familyId: string): Promise<void>
  getBudgetSummary(familyId: string, month: number, year: number): Promise<BudgetSummary | null>
}
