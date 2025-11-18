import type { Budget } from '../entities/budget'

export interface IBudgetRepository {
  create(budget: Budget): Promise<Budget>
  update(budget: Budget): Promise<Budget>
  findByTeamAndPeriod(teamId: string, month: number, year: number): Promise<Budget | null>
}