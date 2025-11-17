import type { BudgetProps } from '../entities/budget'
import type { DashboardMonthlyData } from './dashboard.types.d.ts'

export type BudgetDetailsDTO = Pick<
  BudgetProps,
  | 'id'
  | 'month'
  | 'year'
  | 'totalIncome'
  | 'necessidadesBudget'
  | 'desejosBudget'
  | 'poupancaBudget'
>

export type SaveBudgetDTO = {
  teamId: string
  month: number
  year: number
  totalIncome: number
}

export type ExpenseSummaryDTO = DashboardMonthlyData