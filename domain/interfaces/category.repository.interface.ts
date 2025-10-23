import type { Category } from "../entities/expense"

export interface ICategoryRepository {
  getCategoriesByFamily(familyId: string): Promise<Category[]>
  getCategoryById(categoryId: string, familyId: string): Promise<Category | null>
  createCategory(category: Omit<Category, "id" | "createdAt">): Promise<Category>
  updateCategory(categoryId: string, familyId: string, data: Partial<Category>): Promise<Category>
  deleteCategory(categoryId: string, familyId: string): Promise<void>
  createDefaultCategories(familyId: string): Promise<Category[]>
}
