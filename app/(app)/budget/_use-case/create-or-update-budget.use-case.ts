import type { IBudgetRepository } from "@/domain/interfaces/budget.repository.interface"
import type { Budget } from "@/domain/entities/budget"

export interface CreateOrUpdateBudgetDTO {
  familyId: string
  month: number
  year: number
  necessidadesLimit: number
  desejosLimit: number
  poupancaLimit: number
}

export class CreateOrUpdateBudgetUseCase {
  constructor(private budgetRepository: IBudgetRepository) {}

  async execute(dto: CreateOrUpdateBudgetDTO): Promise<Budget> {
    const existingBudget = await this.budgetRepository.getBudgetByMonthYear(dto.familyId, dto.month, dto.year)

    if (existingBudget) {
      return await this.budgetRepository.updateBudget(existingBudget.id, dto.familyId, {
        necessidadesLimit: dto.necessidadesLimit,
        desejosLimit: dto.desejosLimit,
        poupancaLimit: dto.poupancaLimit,
      })
    }

    return await this.budgetRepository.createBudget({
      familyId: dto.familyId,
      month: dto.month,
      year: dto.year,
      necessidadesLimit: dto.necessidadesLimit,
      desejosLimit: dto.desejosLimit,
      poupancaLimit: dto.poupancaLimit,
    })
  }
}
