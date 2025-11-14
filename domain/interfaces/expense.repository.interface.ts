import type { Expense } from '../entities/expense'

export interface IExpenseRepository {
  create(expense: Expense): Promise<Expense>
  createMany(expenses: Expense[]): Promise<Expense[]>
  update(expense: Expense): Promise<Expense>
  delete(id: string, teamId: string): Promise<void>
  findById(id: string, teamId: string): Promise<Expense | null>
  findByTeamId(teamId: string): Promise<Expense[]>
  findByDateRange(teamId: string, startDate: Date, endDate: Date): Promise<Expense[]>
}