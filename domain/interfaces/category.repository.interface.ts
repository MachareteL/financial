import type { Category } from '../entities/category'

export interface ICategoryRepository {
  findByTeamId(teamId: string): Promise<Category[]>
  findById(categoryId: string, teamId: string): Promise<Category | null>
  create(category: Category): Promise<Category>
  update(category: Category): Promise<Category>
  delete(categoryId: string, teamId: string): Promise<void>
  createDefaultCategories(teamId: string): Promise<Category[]>
}