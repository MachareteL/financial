import type { ICategoryRepository } from "@/domain/IRepositories/category.repository.interface"
import type { Category } from "@/domain/Entities/expense.entity"

export interface GetCategoriesDTO {
  familyId: string
}

export class GetCategoriesUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(dto: GetCategoriesDTO): Promise<Category[]> {
    return await this.categoryRepository.getCategoriesByFamily(dto.familyId)
  }
}
