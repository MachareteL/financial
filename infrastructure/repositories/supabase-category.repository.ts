import type { ICategoryRepository } from '@/domain/interfaces/category.repository.interface'
import { Category } from '@/domain/entities/category'
import { BudgetCategory } from '@/domain/entities/budget-category'
import { getSupabaseClient } from '../database/supabase.client'
import type { Database } from '@/domain/dto/database.types.d.ts'

type CategoryRow = Database['public']['Tables']['categories']['Row']
type BudgetCategoryRow = Database['public']['Tables']['budget_categories']['Row']

type CategoryRowWithRelations = CategoryRow & {
  budget_categories: BudgetCategoryRow | null
}

const CATEGORY_SELECT_QUERY = `
  *,
  budget_categories (*)
`

export class CategoryRepository implements ICategoryRepository {
  private supabase = getSupabaseClient()

  // 1. MAPEAMENTO: DO BANCO (Row) PARA A ENTIDADE
  private mapRowToEntity(row: CategoryRowWithRelations): Category {
    const budgetCategory = row.budget_categories
      ? new BudgetCategory({
          id: row.budget_categories.id,
          teamId: row.budget_categories.team_id,
          name: row.budget_categories.name,
          percentage: Number(row.budget_categories.percentage),
          createdAt: new Date(row.budget_categories.created_at),
        })
      : null

    return new Category({
      id: row.id,
      name: row.name,
      budgetCategoryId: row.budget_category_id!,
      teamId: row.team_id!,
      createdAt: new Date(row.created_at),
      budgetCategory: budgetCategory,
    })
  }

  // 2. MAPEAMENTO: DA ENTIDADE PARA O BANCO (Row)
  private mapEntityToRow(entity: Category): Omit<CategoryRow, 'id' | 'created_at' | 'classification'> {
    return {
      name: entity.name,
      budget_category_id: entity.budgetCategoryId,
      team_id: entity.teamId,
    }
  }

  async findByTeamId(teamId: string): Promise<Category[]> {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from('categories')
      .select(CATEGORY_SELECT_QUERY)
      .eq('team_id', teamId)
      .order('name')

    if (error) throw new Error(error.message)
    return (data || []).map(row => this.mapRowToEntity(row as CategoryRowWithRelations))
  }

  async findById(categoryId: string, teamId: string): Promise<Category | null> {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from('categories')
      .select(CATEGORY_SELECT_QUERY)
      .eq('id', categoryId)
      .eq('team_id', teamId)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data ? this.mapRowToEntity(data as CategoryRowWithRelations) : null
  }

  async create(category: Category): Promise<Category> {
    const row = this.mapEntityToRow(category)
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from('categories')
      .insert({
        ...row,
        id: category.id,
        created_at: category.createdAt.toISOString(),
      })
      .select(CATEGORY_SELECT_QUERY)
      .single()

    if (error) throw new Error(error.message)
    return this.mapRowToEntity(data as CategoryRowWithRelations)
  }

  async update(category: Category): Promise<Category> {
    const row = this.mapEntityToRow(category)
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from('categories')
      .update(row)
      .eq('id', category.id)
      .eq('team_id', category.teamId)
      .select(CATEGORY_SELECT_QUERY)
      .single()

    if (error) throw new Error(error.message)
    return this.mapRowToEntity(data as CategoryRowWithRelations)
  }

  async delete(categoryId: string, teamId: string): Promise<void> {
    const supabase = await getSupabaseClient();
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)
      .eq('team_id', teamId)

    if (error) throw new Error(error.message)
  }

  // 3. ATUALIZADO: Recebe as 'pastas' para saber os IDs
  async createDefaultCategories(teamId: string, budgetCategories: BudgetCategory[]): Promise<Category[]> {
    const budgetCatIds = {
      necessidades: budgetCategories.find(bc => bc.name === 'Necessidades')?.id,
      desejos: budgetCategories.find(bc => bc.name === 'Desejos')?.id,
      poupanca: budgetCategories.find(bc => bc.name === 'Poupança')?.id,
    }

    if (!budgetCatIds.necessidades || !budgetCatIds.desejos || !budgetCatIds.poupanca) {
       throw new Error("Não foi possível encontrar as 'pastas' de orçamento padrão ao criar categorias.");
    }

    const defaultCategories = [
      { name: 'Moradia', budget_category_id: budgetCatIds.necessidades },
      { name: 'Transporte', budget_category_id: budgetCatIds.necessidades },
      { name: 'Alimentação', budget_category_id: budgetCatIds.necessidades },
      { name: 'Saúde', budget_category_id: budgetCatIds.necessidades },
      { name: 'Lazer', budget_category_id: budgetCatIds.desejos },
      { name: 'Investimentos', budget_category_id: budgetCatIds.poupanca },
      { name: 'Outros', budget_category_id: budgetCatIds.necessidades },
    ];

    const categoriesToInsert = defaultCategories.map((cat) => ({
      ...cat,
      team_id: teamId,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    }))

    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from('categories')
      .insert(categoriesToInsert)
      .select(CATEGORY_SELECT_QUERY);

    if (error) throw new Error(error.message)
    return (data || []).map(row => this.mapRowToEntity(row as CategoryRowWithRelations))
  }
}