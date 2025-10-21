import type { IExpenseRepository } from "@/domain/repositories/expense.repository.interface"
import type { Expense, ExpenseWithDetails } from "@/domain/entities/expense.entity"
import { getSupabaseClient } from "../database/supabase.client"

export class ExpenseRepository implements IExpenseRepository {
  private supabase = getSupabaseClient()

  async getExpensesByFamily(familyId: string): Promise<ExpenseWithDetails[]> {
    const { data, error } = await this.supabase
      .from("expenses")
      .select(
        `
        id,
        amount,
        description,
        date,
        receipt_url,
        category_id,
        family_id,
        user_id,
        is_recurring,
        recurrence_type,
        is_installment,
        installment_number,
        total_installments,
        parent_expense_id,
        created_at,
        categories (id, name, classification),
        profiles (name)
      `,
      )
      .eq("family_id", familyId)
      .order("date", { ascending: false })

    if (error) throw new Error(error.message)

    return (data || []).map((item: any) => ({
      id: item.id,
      amount: item.amount,
      description: item.description || "",
      date: new Date(item.date),
      categoryId: item.category_id,
      familyId: item.family_id,
      userId: item.user_id,
      receiptUrl: item.receipt_url,
      isRecurring: item.is_recurring || false,
      recurrenceType: item.recurrence_type,
      isInstallment: item.is_installment || false,
      installmentNumber: item.installment_number,
      totalInstallments: item.total_installments,
      parentExpenseId: item.parent_expense_id,
      createdAt: new Date(item.created_at),
      category: {
        id: item.categories.id,
        name: item.categories.name,
        classification: item.categories.classification,
        familyId: item.family_id,
        createdAt: new Date(item.created_at),
      },
      user: {
        name: item.profiles.name,
      },
    }))
  }

  async getExpenseById(expenseId: string, familyId: string): Promise<ExpenseWithDetails | null> {
    const { data, error } = await this.supabase
      .from("expenses")
      .select(
        `
        id,
        amount,
        description,
        date,
        receipt_url,
        category_id,
        family_id,
        user_id,
        is_recurring,
        recurrence_type,
        is_installment,
        installment_number,
        total_installments,
        parent_expense_id,
        created_at,
        categories (id, name, classification),
        profiles (name)
      `,
      )
      .eq("id", expenseId)
      .eq("family_id", familyId)
      .maybeSingle()

    if (error || !data) return null

    return {
      id: data.id,
      amount: data.amount,
      description: data.description || "",
      date: new Date(data.date),
      categoryId: data.category_id,
      familyId: data.family_id,
      userId: data.user_id,
      receiptUrl: data.receipt_url,
      isRecurring: data.is_recurring || false,
      recurrenceType: data.recurrence_type,
      isInstallment: data.is_installment || false,
      installmentNumber: data.installment_number,
      totalInstallments: data.total_installments,
      parentExpenseId: data.parent_expense_id,
      createdAt: new Date(data.created_at),
      category: {
        id: data.categories.id,
        name: data.categories.name,
        classification: data.categories.classification,
        familyId: data.family_id,
        createdAt: new Date(data.created_at),
      },
      user: {
        name: data.profiles.name,
      },
    }
  }

  async createExpense(expense: Omit<Expense, "id" | "createdAt">): Promise<Expense> {
    const { data, error } = await this.supabase
      .from("expenses")
      .insert({
        amount: expense.amount,
        description: expense.description,
        date: expense.date.toISOString(),
        category_id: expense.categoryId,
        family_id: expense.familyId,
        user_id: expense.userId,
        receipt_url: expense.receiptUrl,
        is_recurring: expense.isRecurring,
        recurrence_type: expense.recurrenceType,
        is_installment: expense.isInstallment,
        installment_number: expense.installmentNumber,
        total_installments: expense.totalInstallments,
        parent_expense_id: expense.parentExpenseId,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    return {
      id: data.id,
      amount: data.amount,
      description: data.description || "",
      date: new Date(data.date),
      categoryId: data.category_id,
      familyId: data.family_id,
      userId: data.user_id,
      receiptUrl: data.receipt_url,
      isRecurring: data.is_recurring || false,
      recurrenceType: data.recurrence_type,
      isInstallment: data.is_installment || false,
      installmentNumber: data.installment_number,
      totalInstallments: data.total_installments,
      parentExpenseId: data.parent_expense_id,
      createdAt: new Date(data.created_at),
    }
  }

  async updateExpense(expenseId: string, familyId: string, data: Partial<Expense>): Promise<Expense> {
    const updateData: any = {}
    if (data.amount !== undefined) updateData.amount = data.amount
    if (data.description !== undefined) updateData.description = data.description
    if (data.date !== undefined) updateData.date = data.date.toISOString()
    if (data.categoryId !== undefined) updateData.category_id = data.categoryId
    if (data.receiptUrl !== undefined) updateData.receipt_url = data.receiptUrl

    const { data: updated, error } = await this.supabase
      .from("expenses")
      .update(updateData)
      .eq("id", expenseId)
      .eq("family_id", familyId)
      .select()
      .single()

    if (error) throw new Error(error.message)

    return {
      id: updated.id,
      amount: updated.amount,
      description: updated.description || "",
      date: new Date(updated.date),
      categoryId: updated.category_id,
      familyId: updated.family_id,
      userId: updated.user_id,
      receiptUrl: updated.receipt_url,
      isRecurring: updated.is_recurring || false,
      recurrenceType: updated.recurrence_type,
      isInstallment: updated.is_installment || false,
      installmentNumber: updated.installment_number,
      totalInstallments: updated.total_installments,
      parentExpenseId: updated.parent_expense_id,
      createdAt: new Date(updated.created_at),
    }
  }

  async deleteExpense(expenseId: string, familyId: string): Promise<void> {
    const { error } = await this.supabase.from("expenses").delete().eq("id", expenseId).eq("family_id", familyId)

    if (error) throw new Error(error.message)
  }

  async getExpensesByDateRange(familyId: string, startDate: Date, endDate: Date): Promise<ExpenseWithDetails[]> {
    const { data, error } = await this.supabase
      .from("expenses")
      .select(
        `
        id,
        amount,
        description,
        date,
        receipt_url,
        category_id,
        family_id,
        user_id,
        is_recurring,
        recurrence_type,
        is_installment,
        installment_number,
        total_installments,
        parent_expense_id,
        created_at,
        categories (id, name, classification),
        profiles (name)
      `,
      )
      .eq("family_id", familyId)
      .gte("date", startDate.toISOString())
      .lte("date", endDate.toISOString())
      .order("date", { ascending: false })

    if (error) throw new Error(error.message)

    return (data || []).map((item: any) => ({
      id: item.id,
      amount: item.amount,
      description: item.description || "",
      date: new Date(item.date),
      categoryId: item.category_id,
      familyId: item.family_id,
      userId: item.user_id,
      receiptUrl: item.receipt_url,
      isRecurring: item.is_recurring || false,
      recurrenceType: item.recurrence_type,
      isInstallment: item.is_installment || false,
      installmentNumber: item.installment_number,
      totalInstallments: item.total_installments,
      parentExpenseId: item.parent_expense_id,
      createdAt: new Date(item.created_at),
      category: {
        id: item.categories.id,
        name: item.categories.name,
        classification: item.categories.classification,
        familyId: item.family_id,
        createdAt: new Date(item.created_at),
      },
      user: {
        name: item.profiles.name,
      },
    }))
  }
}
