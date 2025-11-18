import type { IBudgetCategoryRepository } from '@/domain/interfaces/budget-category.repository.interface'
import type { CreateBudgetCategoryDTO } from '@/domain/dto/budget-category.types.d.ts'
import { BudgetCategory } from '@/domain/entities/budget-category'

export class CreateBudgetCategoryUseCase {
  constructor(private budgetCategoryRepository: IBudgetCategoryRepository) {}

  async execute(dto: CreateBudgetCategoryDTO): Promise<void> {
    const category = new BudgetCategory({
      id: crypto.randomUUID(),
      createdAt: new Date(),
      name: dto.name,
      percentage: dto.percentage,
      teamId: dto.teamId,
    })
    await this.budgetCategoryRepository.create(category)
  }
}