import type { IExpenseRepository } from '@/domain/interfaces/expense.repository.interface'
import { Expense } from '@/domain/entities/expense'
import { Category } from '@/domain/entities/category'
import { BudgetCategory } from '@/domain/entities/budget-category'
import { getSupabaseClient } from '../database/supabase.client'
import type { Database } from '@/domain/dto/database.types.d.ts'

type ExpenseRow = Database['public']['Tables']['expenses']['Row']
type CategoryRow = Database['public']['Tables']['categories']['Row']
type BudgetCategoryRow = Database['public']['Tables']['budget_categories']['Row']
type ProfileRow = Database['public']['Tables']['profiles']['Row']

type CategoryRowWithBudgetCategory = CategoryRow & {
  budget_categories: BudgetCategoryRow | null
}
type ExpenseRowWithRelations = ExpenseRow & {
  categories: CategoryRowWithBudgetCategory | null
  profiles: Pick<ProfileRow, 'name'> | null
}

const EXPENSE_SELECT_QUERY = `
  *,
  categories (
    *,
    budget_categories (*)
  ),
  profiles ( name )
`

export class ExpenseRepository implements IExpenseRepository {

  // 1. MAPEAMENTO: DO BANCO (Row) PARA A ENTIDADE
  private mapRowToEntity(row: ExpenseRowWithRelations): Expense {
    let category: Category | null = null
    
    if (row.categories) {
      const budgetCategory = row.categories.budget_categories
        ? new BudgetCategory({
            id: row.categories.budget_categories.id,
            teamId: row.categories.budget_categories.team_id,
            name: row.categories.budget_categories.name,
            percentage: Number(row.categories.budget_categories.percentage),
            createdAt: new Date(row.categories.budget_categories.created_at),
          })
        : null

      category = new Category({
        id: row.categories.id,
        name: row.categories.name,
        budgetCategoryId: row.categories.budget_category_id!,
        teamId: row.categories.team_id!,
        createdAt: new Date(row.categories.created_at),
        budgetCategory: budgetCategory,
      })
    }

    // Mapeia a Entidade Expense principal
    return new Expense({
      id: row.id,
      amount: row.amount,
      description: row.description,
      date: new Date(row.date.replace(/-/g, '/')), // Converte string 'YYYY-MM-DD'
      teamId: row.team_id!,
      userId: row.user_id!,
      categoryId: row.category_id!,
      receiptUrl: row.receipt_url,
      isRecurring: row.is_recurring ?? false,
      recurrenceType: row.recurrence_type as 'monthly' | 'weekly' | 'yearly' | null,
      isInstallment: row.is_installment ?? false,
      installmentNumber: row.installment_number,
      totalInstallments: row.total_installments,
      parentExpenseId: row.parent_expense_id,
      createdAt: new Date(row.created_at),
      
      category: category,
      owner: row.profiles ? { name: row.profiles.name } : null,
    })
  }

  // 2. MAPEAMENTO: DA ENTIDADE PARA O BANCO (Row)
  private mapEntityToRow(entity: Expense): Omit<ExpenseRow, 'created_at' | 'installment_value'> {
    const props = entity.props 
    return {
      id: props.id,
      amount: props.amount,
      description: props.description ?? null,
      date: props.date.toISOString().split('T')[0], // Formata 'YYYY-MM-DD'
      category_id: props.categoryId,
      team_id: props.teamId,
      user_id: props.userId,
      receipt_url: props.receiptUrl ?? null,
      is_recurring: props.isRecurring,
      recurrence_type: props.recurrenceType ?? null,
      is_installment: props.isInstallment,
      installment_number: props.installmentNumber ?? null,
      total_installments: props.totalInstallments ??  null,
      parent_expense_id: props.parentExpenseId ?? null,
    }
  }

  async create(expense: Expense): Promise<Expense> {
    const results = await this.createMany([expense]);
    if (results.length === 0) {
      throw new Error("Falha ao criar despesa.");
    }
    return results[0];
  }

  async createMany(expenses: Expense[]): Promise<Expense[]> {
    const rows = expenses.map(entity => ({
      ...this.mapEntityToRow(entity),
      id: entity.id,
      created_at: entity.createdAt.toISOString(),
    }));

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('expenses')
      .insert(rows)
      .select(EXPENSE_SELECT_QUERY);

    if (error) {
      console.error("Supabase error batch creating expenses:", error.message)
      throw new Error(error.message)
    }

    return (data || []).map(row => this.mapRowToEntity(row as ExpenseRowWithRelations));
  }

  async update(expense: Expense): Promise<Expense> {
    const row = this.mapEntityToRow(expense)
    const { id, ...updateData } = row;

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('expenses')
      .update(updateData)
      .eq('id', expense.id)
      .eq('team_id', expense.teamId)
      .select(EXPENSE_SELECT_QUERY)
      .single()

    if (error) {
      console.error("Supabase error updating expense:", error.message)
      throw new Error(error.message)
    }
    return this.mapRowToEntity(data as ExpenseRowWithRelations)
  }

  async delete(id: string, teamId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('team_id', teamId)

    if (error) {
      console.error("Supabase error deleting expense:", error.message)
      throw new Error(error.message)
    }
  }

  async findById(id: string, teamId: string): Promise<Expense | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('expenses')
      .select(EXPENSE_SELECT_QUERY)
      .eq('id', id)
      .eq('team_id', teamId)
      .maybeSingle()

    if (error) {
      console.error("Supabase error finding expense by id:", error.message)
      throw new Error(error.message)
    }
    if (!data) return null
    return this.mapRowToEntity(data as ExpenseRowWithRelations)
  }

  async findByTeamId(teamId: string, page: number = 1, limit: number = 20): Promise<Expense[]> {
    const supabase = getSupabaseClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from('expenses')
      .select(EXPENSE_SELECT_QUERY)
      .eq('team_id', teamId)
      .order('date', { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Supabase error finding expenses:", error.message)
      throw new Error(error.message)
    }
    return (data || []).map(row => this.mapRowToEntity(row as ExpenseRowWithRelations))
  }

  async findByDateRange(
    teamId: string, 
    startDate: Date, 
    endDate: Date,
    page: number = 1, 
    limit: number = 20
  ): Promise<Expense[]> {
    const supabase = getSupabaseClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from('expenses')
      .select(EXPENSE_SELECT_QUERY)
      .eq('team_id', teamId)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .order('date', { ascending: false })
      .range(from, to);

    if (error) {
       console.error("Supabase error finding expenses by range:", error.message)
      throw new Error(error.message)
    }
    return (data || []).map(row => this.mapRowToEntity(row as ExpenseRowWithRelations))
  }
}