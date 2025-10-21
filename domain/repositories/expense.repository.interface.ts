import type { Expense, ExpenseWithDetails } from "../entities/expense.entity"

export interface IExpenseRepository {
  getExpensesByFamily(familyId: string): Promise<ExpenseWithDetails[]>
  getExpenseById(expenseId: string, familyId: string): Promise<ExpenseWithDetails | null>
  createExpense(expense: Omit<Expense, "id" | "createdAt">): Promise<Expense>
  updateExpense(expenseId: string, familyId: string, data: Partial<Expense>): Promise<Expense>
  deleteExpense(expenseId: string, familyId: string): Promise<void>
  getExpensesByDateRange(familyId: string, startDate: Date, endDate: Date): Promise<ExpenseWithDetails[]>
}
