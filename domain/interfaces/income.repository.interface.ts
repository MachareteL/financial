// domain/interfaces/income.repository.ts
import type { Income } from '../entities/income'

export interface IIncomeRepository {
  create(income: Income): Promise<Income>
  update(income: Income): Promise<Income>
  delete(id: string, teamId: string): Promise<void>
  findById(id: string, teamId: string): Promise<Income | null>
  findByTeamId(teamId: string): Promise<Income[]>
}