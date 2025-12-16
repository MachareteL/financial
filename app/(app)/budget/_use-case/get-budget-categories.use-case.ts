import type { IBudgetCategoryRepository } from "@/domain/interfaces/budget-category.repository.interface";
import type { BudgetCategoryDetailsDTO } from "@/domain/dto/budget-category.types.d.ts";
import { BudgetCategoryMapper } from "@/domain/mappers/budget-category.mapper";

export class GetBudgetCategoriesUseCase {
  constructor(private budgetCategoryRepository: IBudgetCategoryRepository) {}

  async execute(teamId: string): Promise<BudgetCategoryDetailsDTO[]> {
    const budgetCategories =
      await this.budgetCategoryRepository.findByTeamId(teamId);

    return budgetCategories.map(BudgetCategoryMapper.toDTO);
  }
}
