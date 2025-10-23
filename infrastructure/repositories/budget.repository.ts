import type { IBudgetRepository } from "@/domain/interfaces/budget.repository.interface"
import type { Budget, Income, BudgetSummary } from "@/domain/entities/budget"
import { getSupabaseClient } from "../database/supabase.client"

export class BudgetRepository implements IBudgetRepository {
  private supabase = getSupabaseClient()

  async getBudgetByMonthYear(familyId: string, month: number, year: number): Promise<Budget | null> {
    const { data, error } = await this.supabase
      .from("budgets")
      .select("*")
      .eq("family_id", familyId)
      .eq("month", month)
      .eq("year", year)
      .maybeSingle()

    if (error || !data) return null

    return {
      id: data.id,
      familyId: data.family_id,
      month: data.month,
      year: data.year,
      necessidadesLimit: data.necessidades_limit,
      desejosLimit: data.desejos_limit,
      poupancaLimit: data.poupanca_limit,
      createdAt: new Date(data.created_at),
    }
  }

  async createBudget(budget: Omit<Budget, "id" | "createdAt">): Promise<Budget> {
    const { data, error } = await this.supabase
      .from("budgets")
      .insert({
        family_id: budget.familyId,
        month: budget.month,
        year: budget.year,
        necessidades_limit: budget.necessidadesLimit,
        desejos_limit: budget.desejosLimit,
        poupanca_limit: budget.poupancaLimit,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    return {
      id: data.id,
      familyId: data.family_id,
      month: data.month,
      year: data.year,
      necessidadesLimit: data.necessidades_limit,
      desejosLimit: data.desejos_limit,
      poupancaLimit: data.poupanca_limit,
      createdAt: new Date(data.created_at),
    }
  }

  async updateBudget(budgetId: string, familyId: string, data: Partial<Budget>): Promise<Budget> {
    const updateData: any = {}
    if (data.necessidadesLimit !== undefined) updateData.necessidades_limit = data.necessidadesLimit
    if (data.desejosLimit !== undefined) updateData.desejos_limit = data.desejosLimit
    if (data.poupancaLimit !== undefined) updateData.poupanca_limit = data.poupancaLimit

    const { data: updated, error } = await this.supabase
      .from("budgets")
      .update(updateData)
      .eq("id", budgetId)
      .eq("family_id", familyId)
      .select()
      .single()

    if (error) throw new Error(error.message)

    return {
      id: updated.id,
      familyId: updated.family_id,
      month: updated.month,
      year: updated.year,
      necessidadesLimit: updated.necessidades_limit,
      desejosLimit: updated.desejos_limit,
      poupancaLimit: updated.poupanca_limit,
      createdAt: new Date(updated.created_at),
    }
  }

  async getIncomesByMonthYear(familyId: string, month: number, year: number): Promise<Income[]> {
    const { data, error } = await this.supabase
      .from("incomes")
      .select("*")
      .eq("family_id", familyId)
      .eq("month", month)
      .eq("year", year)

    if (error) throw new Error(error.message)

    return (data || []).map((item) => ({
      id: item.id,
      familyId: item.family_id,
      userId: item.user_id,
      amount: item.amount,
      description: item.description,
      month: item.month,
      year: item.year,
      createdAt: new Date(item.created_at),
    }))
  }

  async createIncome(income: Omit<Income, "id" | "createdAt">): Promise<Income> {
    const { data, error } = await this.supabase
      .from("incomes")
      .insert({
        family_id: income.familyId,
        user_id: income.userId,
        amount: income.amount,
        description: income.description,
        month: income.month,
        year: income.year,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    return {
      id: data.id,
      familyId: data.family_id,
      userId: data.user_id,
      amount: data.amount,
      description: data.description,
      month: data.month,
      year: data.year,
      createdAt: new Date(data.created_at),
    }
  }

  async updateIncome(incomeId: string, familyId: string, data: Partial<Income>): Promise<Income> {
    const updateData: any = {}
    if (data.amount !== undefined) updateData.amount = data.amount
    if (data.description !== undefined) updateData.description = data.description

    const { data: updated, error } = await this.supabase
      .from("incomes")
      .update(updateData)
      .eq("id", incomeId)
      .eq("family_id", familyId)
      .select()
      .single()

    if (error) throw new Error(error.message)

    return {
      id: updated.id,
      familyId: updated.family_id,
      userId: updated.user_id,
      amount: updated.amount,
      description: updated.description,
      month: updated.month,
      year: updated.year,
      createdAt: new Date(updated.created_at),
    }
  }

  async deleteIncome(incomeId: string, familyId: string): Promise<void> {
    const { error } = await this.supabase.from("incomes").delete().eq("id", incomeId).eq("family_id", familyId)

    if (error) throw new Error(error.message)
  }

  async getBudgetSummary(familyId: string, month: number, year: number): Promise<BudgetSummary | null> {
    const budget = await this.getBudgetByMonthYear(familyId, month, year)
    if (!budget) return null

    const incomes = await this.getIncomesByMonthYear(familyId, month, year)
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0)

    // Get expenses for the month
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    const { data: expenses } = await this.supabase
      .from("expenses")
      .select("amount, categories(classification)")
      .eq("family_id", familyId)
      .gte("date", startDate.toISOString())
      .lte("date", endDate.toISOString())

    let necessidadesSpent = 0
    let desejosSpent = 0
    let poupancaSpent = 0

    expenses?.forEach((expense: any) => {
      const classification = expense.categories?.classification
      if (classification === "necessidades") necessidadesSpent += expense.amount
      else if (classification === "desejos") desejosSpent += expense.amount
      else if (classification === "poupanca") poupancaSpent += expense.amount
    })

    return {
      budget,
      incomes,
      totalIncome,
      necessidadesSpent,
      desejosSpent,
      poupancaSpent,
      totalSpent: necessidadesSpent + desejosSpent + poupancaSpent,
    }
  }
}
