import type { IBudgetCategoryRepository } from "@/domain/interfaces/budget-category.repository.interface";
import { BudgetCategory } from "@/domain/entities/budget-category";
import { getSupabaseClient } from "../database/supabase.server";
import type { Database } from "@/domain/dto/database.types.d.ts";

type BudgetCategoryRow =
  Database["public"]["Tables"]["budget_categories"]["Row"];

export class ServerSupabaseBudgetCategoryRepository
  implements IBudgetCategoryRepository
{
  private mapRowToEntity(row: BudgetCategoryRow): BudgetCategory {
    return new BudgetCategory({
      id: row.id,
      teamId: row.team_id,
      name: row.name,
      percentage: Number(row.percentage),
      createdAt: new Date(row.created_at),
    });
  }

  private mapEntityToRow(
    entity: BudgetCategory
  ): Omit<BudgetCategoryRow, "id" | "created_at"> {
    return {
      name: entity.name,
      percentage: entity.percentage,
      team_id: entity.teamId,
    };
  }

  async findByTeamId(teamId: string): Promise<BudgetCategory[]> {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("budget_categories")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at");

    if (error) throw new Error(error.message);
    return (data || []).map((row) => this.mapRowToEntity(row));
  }

  async findById(id: string, teamId: string): Promise<BudgetCategory | null> {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("budget_categories")
      .select("*")
      .eq("id", id)
      .eq("team_id", teamId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? this.mapRowToEntity(data) : null;
  }

  async create(budgetCategory: BudgetCategory): Promise<BudgetCategory> {
    const row = this.mapEntityToRow(budgetCategory);
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("budget_categories")
      .insert({
        ...row,
        id: budgetCategory.id,
        created_at: budgetCategory.createdAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapRowToEntity(data);
  }

  async update(budgetCategory: BudgetCategory): Promise<BudgetCategory> {
    const row = this.mapEntityToRow(budgetCategory);
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("budget_categories")
      .update(row)
      .eq("id", budgetCategory.id)
      .eq("team_id", budgetCategory.teamId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapRowToEntity(data);
  }

  async delete(id: string, teamId: string): Promise<void> {
    const supabase = await getSupabaseClient();
    const { error } = await supabase
      .from("budget_categories")
      .delete()
      .eq("id", id)
      .eq("team_id", teamId);

    if (error) throw new Error(error.message);
  }

  async createDefaultCategories(teamId: string): Promise<BudgetCategory[]> {
    const defaultCategories = [
      { name: "Necessidades", percentage: 50 },
      { name: "Desejos", percentage: 30 },
      { name: "Poupança", percentage: 20 },
    ];

    const categoriesToInsert = defaultCategories.map((cat) => ({
      ...cat,
      team_id: teamId,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    }));

    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("budget_categories")
      .insert(categoriesToInsert)
      .select();

    if (error) throw new Error(error.message);
    return (data || []).map((row) => this.mapRowToEntity(row));
  }
}
