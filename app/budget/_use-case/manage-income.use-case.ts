import type { IBudgetRepository } from "@/domain/IRepositories/budget.repository.interface"
import type { Income } from "@/domain/Entities/budget.entity"

export interface CreateIncomeDTO {
  familyId: string
  userId: string
  amount: number
  description: string
  month: number
  year: number
}

export interface UpdateIncomeDTO {
  incomeId: string
  familyId: string
  amount?: number
  description?: string
}

export interface DeleteIncomeDTO {
  incomeId: string
  familyId: string
}

export class ManageIncomeUseCase {
  constructor(private budgetRepository: IBudgetRepository) {}

  async createIncome(dto: CreateIncomeDTO): Promise<Income> {
    return await this.budgetRepository.createIncome({
      familyId: dto.familyId,
      userId: dto.userId,
      amount: dto.amount,
      description: dto.description,
      month: dto.month,
      year: dto.year,
    })
  }

  async updateIncome(dto: UpdateIncomeDTO): Promise<Income> {
    return await this.budgetRepository.updateIncome(dto.incomeId, dto.familyId, {
      amount: dto.amount,
      description: dto.description,
    })
  }

  async deleteIncome(dto: DeleteIncomeDTO): Promise<void> {
    await this.budgetRepository.deleteIncome(dto.incomeId, dto.familyId)
  }
}
