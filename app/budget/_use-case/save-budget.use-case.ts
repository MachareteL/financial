import type { IBudgetRepository } from '@/domain/interfaces/budget.repository.interface'
import type { SaveBudgetDTO } from '@/domain/dto/budget.types.d.ts'
import { Budget } from '@/domain/entities/budget'

export class SaveBudgetUseCase {
  constructor(private budgetRepository: IBudgetRepository) {}

  async execute(dto: SaveBudgetDTO): Promise<void> {
    const necessidadesBudget = dto.totalIncome * 0.5
    const desejosBudget = dto.totalIncome * 0.3
    const poupancaBudget = dto.totalIncome * 0.2

    const existingBudget = await this.budgetRepository.findByTeamAndPeriod(
      dto.teamId,
      dto.month,
      dto.year,
    )

    if (existingBudget) {
      const updatedBudget = existingBudget.update({
        totalIncome: dto.totalIncome,
        necessidadesBudget,
        desejosBudget,
        poupancaBudget,
      })
      await this.budgetRepository.update(updatedBudget)
    } else {
      // 3. Cria um novo orçamento
      const budget = new Budget({
        id: crypto.randomUUID(),
        month: dto.month,
        year: dto.year,
        totalIncome: dto.totalIncome,
        necessidadesBudget,
        desejosBudget,
        poupancaBudget,
        teamId: dto.teamId,
        createdAt: new Date(),
      })
      await this.budgetRepository.create(budget)
    }
  }
}