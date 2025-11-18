import type { IBudgetCategoryRepository } from '@/domain/interfaces/budget-category.repository.interface'
import type { UpdateBudgetCategoryDTO } from '@/domain/dto/budget-category.types.d.ts'

export class UpdateBudgetCategoryUseCase {
  constructor(private budgetCategoryRepository: IBudgetCategoryRepository) {}

  async execute(dto: UpdateBudgetCategoryDTO): Promise<void> {
    const existing = await this.budgetCategoryRepository.findById(dto.budgetCategoryId, dto.teamId)
    if (!existing) throw new Error("Categoria de orçamento não encontrada")
    
    const updated = existing.update({
      name: dto.name,
      percentage: dto.percentage,
    })
    
    await this.budgetCategoryRepository.update(updated)
  }
}