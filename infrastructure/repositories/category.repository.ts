import type { ICategoryRepository } from "@/domain/interfaces/category.repository.interface"
import type { Category } from "@/domain/entities/expense"
import { getSupabaseClient } from "../database/supabase.client"

export class CategoryRepository implements ICategoryRepository {
  private supabase = getSupabaseClient()

  async getCategoriesByFamily(familyId: string): Promise<Category[]> {
    const { data, error } = await this.supabase.from("categories").select("*").eq("family_id", familyId).order("name")

    if (error) throw new Error(error.message)

    return (data || []).map((item) => ({
      id: item.id,
      name: item.name,
      classification: item.classification,
      familyId: item.family_id,
      createdAt: new Date(item.created_at),
    }))
  }

  async getCategoryById(categoryId: string, familyId: string): Promise<Category | null> {
    const { data, error } = await this.supabase
      .from("categories")
      .select("*")
      .eq("id", categoryId)
      .eq("family_id", familyId)
      .maybeSingle()

    if (error || !data) return null

    return {
      id: data.id,
      name: data.name,
      classification: data.classification,
      familyId: data.family_id,
      createdAt: new Date(data.created_at),
    }
  }

  async createCategory(category: Omit<Category, "id" | "createdAt">): Promise<Category> {
    const { data, error } = await this.supabase
      .from("categories")
      .insert({
        name: category.name,
        classification: category.classification,
        family_id: category.familyId,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    return {
      id: data.id,
      name: data.name,
      classification: data.classification,
      familyId: data.family_id,
      createdAt: new Date(data.created_at),
    }
  }

  async updateCategory(categoryId: string, familyId: string, data: Partial<Category>): Promise<Category> {
    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.classification !== undefined) updateData.classification = data.classification

    const { data: updated, error } = await this.supabase
      .from("categories")
      .update(updateData)
      .eq("id", categoryId)
      .eq("family_id", familyId)
      .select()
      .single()

    if (error) throw new Error(error.message)

    return {
      id: updated.id,
      name: updated.name,
      classification: updated.classification,
      familyId: updated.family_id,
      createdAt: new Date(updated.created_at),
    }
  }

  async deleteCategory(categoryId: string, familyId: string): Promise<void> {
    const { error } = await this.supabase.from("categories").delete().eq("id", categoryId).eq("family_id", familyId)

    if (error) throw new Error(error.message)
  }

  async createDefaultCategories(familyId: string): Promise<Category[]> {
    const defaultCategories = [
      { name: "Moradia", classification: "necessidades" as const },
      { name: "Transporte", classification: "necessidades" as const },
      { name: "Alimentação", classification: "necessidades" as const },
      { name: "Lazer", classification: "desejos" as const },
      { name: "Saúde", classification: "necessidades" as const },
      { name: "Investimentos", classification: "poupanca" as const },
      { name: "Outros", classification: "necessidades" as const },
    ]

    const categoriesToInsert = defaultCategories.map((cat) => ({
      ...cat,
      family_id: familyId,
    }))

    const { data, error } = await this.supabase.from("categories").insert(categoriesToInsert).select()

    if (error) throw new Error(error.message)

    return (data || []).map((item) => ({
      id: item.id,
      name: item.name,
      classification: item.classification,
      familyId: item.family_id,
      createdAt: new Date(item.created_at),
    }))
  }
}
