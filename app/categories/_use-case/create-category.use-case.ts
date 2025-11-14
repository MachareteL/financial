import type { ICategoryRepository } from "@/domain/interfaces/category.repository.interface";
import type { CreateCategoryDTO } from "@/domain/dto/category.types.d.ts";
import { Category } from "@/domain/entities/category";

export class CreateCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(dto: CreateCategoryDTO): Promise<void> {
    const category = new Category({
      id: crypto.randomUUID(),
      createdAt: new Date(),
      name: dto.name,
      classification: dto.classification,
      teamId: dto.teamId,
    });

    await this.categoryRepository.create(category);
  }
}
