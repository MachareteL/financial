import type { IExpenseRepository } from '@/domain/interfaces/expense.repository.interface'
import { Expense } from '@/domain/entities/expense'
import { Category } from '@/domain/entities/category'
import { getSupabaseClient } from '../database/supabase.client'
import type { Database } from '@/domain/dto/database.types.d.ts'

// Tipos do Supabase (gerados)
type ExpenseRow = Database['public']['Tables']['expenses']['Row']
type CategoryRow = Database['public']['Tables']['categories']['Row']
type ProfileRow = Database['public']['Tables']['profiles']['Row']

// Tipo para o JOIN
type ExpenseRowWithRelations = ExpenseRow & {
  categories: CategoryRow | null
  profiles: Pick<ProfileRow, 'name'> | null
}

const EXPENSE_SELECT_QUERY = `
  *,
  categories (*),
  profiles ( name )
`

export class ExpenseRepository implements IExpenseRepository {
  private supabase = getSupabaseClient()

  // 1. MAPEAMENTO: DO BANCO (Row) PARA A ENTIDADE
  private mapRowToEntity(row: ExpenseRowWithRelations): Expense {
    const category = row.categories
      ? new Category({
          id: row.categories.id,
          name: row.categories.name,
          classification: row.categories.classification as 'necessidades' | 'desejos' | 'poupanca',
          teamId: row.categories.team_id!,
          createdAt: new Date(row.categories.created_at),
        })
      : null

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
    return {
      id: entity.props.id,
      amount: entity.props.amount,
      description: entity.props.description ?? null,
      date: entity.props.date.toISOString().split('T')[0], // Formata 'YYYY-MM-DD'
      category_id: entity.props.categoryId,
      team_id: entity.props.teamId,
      user_id: entity.props.userId,
      receipt_url: entity.props.receiptUrl ?? null,
      is_recurring: entity.props.isRecurring,
      recurrence_type: entity.props.recurrenceType ?? null,
      is_installment: entity.props.isInstallment,
      installment_number: entity.props.installmentNumber ?? null,
      total_installments: entity.props.totalInstallments ??  null,
      parent_expense_id: entity.props.parentExpenseId ?? null,
    }
  }

  async create(expense: Expense): Promise<Expense> {
    const row = this.mapEntityToRow(expense)
    const { data, error } = await this.supabase
      .from('expenses')
      .insert({
        ...row,
        created_at: expense.props.createdAt.toISOString(),
      })
      .select(EXPENSE_SELECT_QUERY)
      .single()

    if (error) {
      console.error("Supabase error creating expense:", error.message)
      throw new Error(error.message)
    }
    return this.mapRowToEntity(data as ExpenseRowWithRelations)
  }

  async createMany(expenses: Expense[]): Promise<Expense[]> {
    const rows = expenses.map(expense => ({
      ...this.mapEntityToRow(expense),
      created_at: expense.props.createdAt.toISOString(),
    }))
    
    const { data, error } = await this.supabase
      .from('expenses')
      .insert(rows)
      .select(EXPENSE_SELECT_QUERY)
    if (error) {
      console.error("Supabase error creating multiple expenses:", error.message)
      throw new Error(error.message)
    }
    return (data || []).map(row => this.mapRowToEntity(row as ExpenseRowWithRelations))
  }

  async update(expense: Expense): Promise<Expense> {
    const row = this.mapEntityToRow(expense)
    const { data, error } = await this.supabase
      .from('expenses')
      .update(row)
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
    const { error } = await this.supabase
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
    const { data, error } = await this.supabase
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

  async findByTeamId(teamId: string): Promise<Expense[]> {
    const { data, error } = await this.supabase
      .from('expenses')
      .select(EXPENSE_SELECT_QUERY)
      .eq('team_id', teamId)
      .order('date', { ascending: false })

    if (error) {
      console.error("Supabase error finding expenses by team:", error.message)
      throw new Error(error.message)
    }
    return (data || []).map(row => this.mapRowToEntity(row as ExpenseRowWithRelations))
  }

  async findByDateRange(teamId: string, startDate: Date, endDate: Date): Promise<Expense[]> {
    const { data, error } = await this.supabase
      .from('expenses')
      .select(EXPENSE_SELECT_QUERY)
      .eq('team_id', teamId)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .order('date', { ascending: false })

    if (error) {
       console.error("Supabase error finding expenses by date range:", error.message)
      throw new Error(error.message)
    }
    return (data || []).map(row => this.mapRowToEntity(row as ExpenseRowWithRelations))
  }
}