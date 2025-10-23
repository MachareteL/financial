import type { IInvestmentRepository } from "@/domain/interfaces/investment.repository.interface"
import type { Investment } from "@/domain/entities/investment"
import { getSupabaseClient } from "../database/supabase.client"

export class InvestmentRepository implements IInvestmentRepository {
  private supabase = getSupabaseClient()

  async getInvestmentsByFamily(familyId: string): Promise<Investment[]> {
    const { data, error } = await this.supabase
      .from("investments")
      .select("*")
      .eq("family_id", familyId)
      .order("purchase_date", { ascending: false })

    if (error) throw new Error(error.message)

    return (data || []).map((item) => ({
      id: item.id,
      familyId: item.family_id,
      userId: item.user_id,
      name: item.name,
      type: item.type,
      amount: item.amount,
      currentValue: item.current_value,
      purchaseDate: new Date(item.purchase_date),
      notes: item.notes,
      createdAt: new Date(item.created_at),
    }))
  }

  async getInvestmentById(investmentId: string, familyId: string): Promise<Investment | null> {
    const { data, error } = await this.supabase
      .from("investments")
      .select("*")
      .eq("id", investmentId)
      .eq("family_id", familyId)
      .maybeSingle()

    if (error || !data) return null

    return {
      id: data.id,
      familyId: data.family_id,
      userId: data.user_id,
      name: data.name,
      type: data.type,
      amount: data.amount,
      currentValue: data.current_value,
      purchaseDate: new Date(data.purchase_date),
      notes: data.notes,
      createdAt: new Date(data.created_at),
    }
  }

  async createInvestment(investment: Omit<Investment, "id" | "createdAt">): Promise<Investment> {
    const { data, error } = await this.supabase
      .from("investments")
      .insert({
        family_id: investment.familyId,
        user_id: investment.userId,
        name: investment.name,
        type: investment.type,
        amount: investment.amount,
        current_value: investment.currentValue,
        purchase_date: investment.purchaseDate.toISOString(),
        notes: investment.notes,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    return {
      id: data.id,
      familyId: data.family_id,
      userId: data.user_id,
      name: data.name,
      type: data.type,
      amount: data.amount,
      currentValue: data.current_value,
      purchaseDate: new Date(data.purchase_date),
      notes: data.notes,
      createdAt: new Date(data.created_at),
    }
  }

  async updateInvestment(investmentId: string, familyId: string, data: Partial<Investment>): Promise<Investment> {
    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.type !== undefined) updateData.type = data.type
    if (data.amount !== undefined) updateData.amount = data.amount
    if (data.currentValue !== undefined) updateData.current_value = data.currentValue
    if (data.purchaseDate !== undefined) updateData.purchase_date = data.purchaseDate.toISOString()
    if (data.notes !== undefined) updateData.notes = data.notes

    const { data: updated, error } = await this.supabase
      .from("investments")
      .update(updateData)
      .eq("id", investmentId)
      .eq("family_id", familyId)
      .select()
      .single()

    if (error) throw new Error(error.message)

    return {
      id: updated.id,
      familyId: updated.family_id,
      userId: updated.user_id,
      name: updated.name,
      type: updated.type,
      amount: updated.amount,
      currentValue: updated.current_value,
      purchaseDate: new Date(updated.purchase_date),
      notes: updated.notes,
      createdAt: new Date(updated.created_at),
    }
  }

  async deleteInvestment(investmentId: string, familyId: string): Promise<void> {
    const { error } = await this.supabase.from("investments").delete().eq("id", investmentId).eq("family_id", familyId)

    if (error) throw new Error(error.message)
  }
}
