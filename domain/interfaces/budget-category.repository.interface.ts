import type { BudgetCategory } from '../entities/budget-category'

export interface IBudgetCategoryRepository {
  findByTeamId(teamId: string): Promise<BudgetCategory[]>
  create(category: BudgetCategory): Promise<BudgetCategory>
  update(category: BudgetCategory): Promise<BudgetCategory>
  delete(id: string, teamId: string): Promise<void>
  
  createDefaultCategories(teamId: string): Promise<BudgetCategory[]>
}