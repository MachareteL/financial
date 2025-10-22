import type { IBudgetRepository } from "@/domain/IRepositories/budget.repository"
import { Budget } from "@/domain/Entities/budget.entity"
import { supabase } from "@/lib/supabase"

export class SupabaseBudgetRepository implements IBudgetRepository {
  async create(budget: Budget): Promise<void> {
    const { error } = await supabase.from("budgets").insert({
      id: budget.id,
      month: budget.month,
      year: budget.year,
      total_income: budget.totalIncome,
      necessidades_budget: budget.necessidadesBudget,
      desejos_budget: budget.desejosBudget,
      poupanca_budget: budget.poupancaBudget,
      family_id: budget.familyId,
    })

    if (error) throw new Error(error.message)
  }

  async update(budget: Budget): Promise<void> {
    const { error } = await supabase
      .from("budgets")
      .update({
        total_income: budget.totalIncome,
        necessidades_budget: budget.necessidadesBudget,
        desejos_budget: budget.desejosBudget,
        poupanca_budget: budget.poupancaBudget,
      })
      .eq("id", budget.id)

    if (error) throw new Error(error.message)
  }

  async findByFamilyAndPeriod(familyId: string, month: number, year: number): Promise<Budget | null> {
    const { data, error } = await supabase
      .from("budgets")
      .select("*")
      .eq("family_id", familyId)
      .eq("month", month)
      .eq("year", year)
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (!data) return null

    return new Budget(
      data.id,
      data.month,
      data.year,
      data.total_income,
      data.necessidades_budget,
      data.desejos_budget,
      data.poupanca_budget,
      data.family_id,
    )
  }
}
