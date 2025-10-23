import type { ICategoryRepository } from "@/domain/interfaces/category.repository.interface"
import type { Category } from "@/domain/entities/expense"

export interface GetCategoriesDTO {
  familyId: string
}

export class GetCategoriesUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(dto: GetCategoriesDTO): Promise<Category[]> {
    return await this.categoryRepository.getCategoriesByFamily(dto.familyId)
  }
}
