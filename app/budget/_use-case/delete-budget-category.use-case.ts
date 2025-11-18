import type { IBudgetCategoryRepository } from '@/domain/interfaces/budget-category.repository.interface'

export class DeleteBudgetCategoryUseCase {
  constructor(private budgetCategoryRepository: IBudgetCategoryRepository) {}

  async execute(id: string, teamId: string): Promise<void> {
    await this.budgetCategoryRepository.delete(id, teamId)
  }
}