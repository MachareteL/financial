import type { IBudgetCategoryRepository } from "@/domain/interfaces/budget-category.repository.interface";
import { BudgetCategory } from "@/domain/entities/budget-category";
import { getSupabaseClient } from "../database/supabase.client";
import type { Database } from "@/domain/dto/database.types.d.ts";

type BudgetCategoryRow =
  Database["public"]["Tables"]["budget_categories"]["Row"];

export class BudgetCategoryRepository implements IBudgetCategoryRepository {
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
      team_id: entity.teamId,
      name: entity.name,
      percentage: entity.percentage,
    };
  }

  async findByTeamId(teamId: string): Promise<BudgetCategory[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("budget_categories")
      .select("*")
      .eq("team_id", teamId)
      .order("name");

    if (error) throw new Error(error.message);
    return (data || []).map(this.mapRowToEntity);
  }

  async findById(id: string, teamId: string): Promise<BudgetCategory | null> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("budget_categories")
      .select("*")
      .eq("id", id)
      .eq("team_id", teamId)
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return this.mapRowToEntity(data);
  }

  async create(category: BudgetCategory): Promise<BudgetCategory> {
    const supabase = getSupabaseClient();
    const row = this.mapEntityToRow(category);

    const { data, error } = await supabase
      .from("budget_categories")
      .insert({
        ...row,
        id: category.id,
        created_at: category.createdAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapRowToEntity(data);
  }

  async update(category: BudgetCategory): Promise<BudgetCategory> {
    const row = this.mapEntityToRow(category);
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("budget_categories")
      .update(row)
      .eq("id", category.id)
      .eq("team_id", category.teamId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapRowToEntity(data);
  }

  async delete(id: string, teamId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("budget_categories")
      .delete()
      .eq("id", id)
      .eq("team_id", teamId);

    if (error) throw new Error(error.message);
  }

  async createDefaultCategories(teamId: string): Promise<BudgetCategory[]> {
    const defaults = [
      {
        name: "Necessidades",
        percentage: 0.5,
        team_id: teamId,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      },
      {
        name: "Desejos",
        percentage: 0.3,
        team_id: teamId,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      },
      {
        name: "Poupança",
        percentage: 0.2,
        team_id: teamId,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      },
    ];

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("budget_categories")
      .insert(defaults)
      .select();

    if (error) throw new Error(error.message);
    return (data || []).map(this.mapRowToEntity);
  }
}
