import type { IIncomeRepository } from "@/domain/repositories/income.repository"
import { Income } from "@/domain/entities/income.entity"
import { supabase } from "@/lib/supabase"

export class SupabaseIncomeRepository implements IIncomeRepository {
  async create(income: Income): Promise<void> {
    const { error } = await supabase.from("incomes").insert({
      id: income.id,
      amount: income.amount,
      description: income.description,
      type: income.type,
      frequency: income.frequency,
      date: income.date.toISOString().split("T")[0],
      family_id: income.familyId,
      user_id: income.userId,
    })

    if (error) throw new Error(error.message)
  }

  async update(income: Income): Promise<void> {
    const { error } = await supabase
      .from("incomes")
      .update({
        amount: income.amount,
        description: income.description,
        type: income.type,
        frequency: income.frequency,
        date: income.date.toISOString().split("T")[0],
      })
      .eq("id", income.id)

    if (error) throw new Error(error.message)
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("incomes").delete().eq("id", id)

    if (error) throw new Error(error.message)
  }

  async findById(id: string): Promise<Income | null> {
    const { data, error } = await supabase.from("incomes").select("*").eq("id", id).maybeSingle()

    if (error) throw new Error(error.message)
    if (!data) return null

    return new Income(
      data.id,
      data.amount,
      data.description,
      data.type,
      new Date(data.date),
      data.family_id,
      data.user_id,
      data.frequency,
    )
  }

  async findByFamilyId(familyId: string): Promise<Income[]> {
    const { data: incomesData, error: incomesError } = await supabase
      .from("incomes")
      .select("id, amount, description, type, frequency, date, user_id, family_id")
      .eq("family_id", familyId)
      .order("date", { ascending: false })

    if (incomesError) throw new Error(incomesError.message)
    if (!incomesData || incomesData.length === 0) return []

    const userIds = [...new Set(incomesData.map((income) => income.user_id))]
    const { data: usersData, error: usersError } = await supabase.from("profiles").select("id, name").in("id", userIds)

    if (usersError) throw new Error(usersError.message)

    const userNameMap = new Map(usersData.map((user) => [user.id, user.name]))

    return incomesData.map(
      (data) =>
        new Income(
          data.id,
          data.amount,
          data.description,
          data.type,
          new Date(data.date),
          data.family_id,
          data.user_id,
          data.frequency,
          userNameMap.get(data.user_id) || null,
        ),
    )
  }
}
