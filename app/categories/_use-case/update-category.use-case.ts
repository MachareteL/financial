import type { ICategoryRepository } from "@/domain/interfaces/category.repository.interface";
import type { UpdateCategoryDTO } from "@/domain/dto/category.types.d.ts";

export class UpdateCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(dto: UpdateCategoryDTO): Promise<void> {
    const existingCategory = await this.categoryRepository.findById(
      dto.categoryId,
      dto.teamId
    );

    if (!existingCategory) {
      throw new Error("Categoria não encontrada ou você não tem permissão");
    }
    
    const updatedCategory = existingCategory.update({
      name: dto.name,
      budgetCategoryId: dto.budgetCategoryId,
    });

    await this.categoryRepository.update(updatedCategory);
  }
}