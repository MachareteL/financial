import type { ICategoryRepository } from "@/domain/interfaces/category.repository.interface";
import type { UpdateCategoryDTO } from "@/domain/dto/category.types.d.ts";

import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";

export class UpdateCategoryUseCase {
  constructor(
    private categoryRepository: ICategoryRepository,
    private teamRepository: ITeamRepository
  ) {}

  async execute(dto: UpdateCategoryDTO): Promise<void> {
    const hasPermission = await this.teamRepository.verifyPermission(
      dto.userId,
      dto.teamId,
      "MANAGE_BUDGET"
    );
    if (!hasPermission) throw new Error("Permissão negada.");

    const existingCategory = await this.categoryRepository.findById(
      dto.categoryId,
      dto.teamId
    );

    if (!existingCategory) {
      throw new Error("Categoria não encontrada.");
    }

    const updatedCategory = existingCategory.update({
      name: dto.name,
      budgetCategoryId: dto.budgetCategoryId,
    });

    await this.categoryRepository.update(updatedCategory);
  }
}
