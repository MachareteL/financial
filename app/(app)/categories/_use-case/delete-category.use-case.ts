import type { ICategoryRepository } from "@/domain/interfaces/category.repository.interface";
import type { DeleteCategoryDTO } from "@/domain/dto/category.types.d.ts";

export class DeleteCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(dto: DeleteCategoryDTO): Promise<void> {
    await this.categoryRepository.delete(dto.categoryId, dto.teamId);
  }
}