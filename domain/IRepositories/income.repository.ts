import type { Income } from "../Entities/income.entity"

export interface IIncomeRepository {
  create(income: Income): Promise<void>
  update(income: Income): Promise<void>
  delete(id: string): Promise<void>
  findById(id: string): Promise<Income | null>
  findByFamilyId(familyId: string): Promise<Income[]>
}
