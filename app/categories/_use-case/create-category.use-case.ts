import type { ICategoryRepository } from "@/domain/interfaces/category.repository.interface"
import type { Category } from "@/domain/entities/expense"

export interface CreateCategoryDTO {
  name: string
  classification: "necessidades" | "desejos" | "poupanca"
  familyId: string
}

export class CreateCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(dto: CreateCategoryDTO): Promise<Category> {
    return await this.categoryRepository.createCategory({
      name: dto.name,
      classification: dto.classification,
      familyId: dto.familyId,
    })
  }
}
