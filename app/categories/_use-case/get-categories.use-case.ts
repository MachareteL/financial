import type { ICategoryRepository } from '@/domain/interfaces/category.repository.interface'
import type { CategoryDetailsDTO } from '@/domain/dto/category.types' 

export class GetCategoriesUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(teamId: string): Promise<CategoryDetailsDTO[]> {
    const categories = await this.categoryRepository.findByTeamId(teamId)
    
    return categories.map(category => ({
      id: category.id,
      name: category.name,
      classification: category.classification,
    }))
  }
}