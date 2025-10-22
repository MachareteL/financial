import type { ICategoryRepository } from "@/domain/repositories/category.repository.interface"
import type { Category } from "@/domain/entities/expense.entity"

export interface UpdateCategoryDTO {
  categoryId: string
  familyId: string
  name?: string
  classification?: "necessidades" | "desejos" | "poupanca"
}

export class UpdateCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(dto: UpdateCategoryDTO): Promise<Category> {
    return await this.categoryRepository.updateCategory(dto.categoryId, dto.familyId, {
      name: dto.name,
      classification: dto.classification,
    })
  }
}
