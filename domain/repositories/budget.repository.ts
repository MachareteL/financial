import type { Budget } from "../entities/budget.entity"

export interface IBudgetRepository {
  create(budget: Budget): Promise<void>
  update(budget: Budget): Promise<void>
  findByFamilyAndPeriod(familyId: string, month: number, year: number): Promise<Budget | null>
}
