import type { ICategoryRepository } from "@/domain/interfaces/category.repository.interface"

export interface DeleteCategoryDTO {
  categoryId: string
  familyId: string
}

export class DeleteCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(dto: DeleteCategoryDTO): Promise<void> {
    await this.categoryRepository.deleteCategory(dto.categoryId, dto.familyId)
  }
}
