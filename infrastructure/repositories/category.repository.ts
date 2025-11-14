import type { ICategoryRepository } from "@/domain/interfaces/category.repository.interface";
import { Category, type CategoryProps } from "@/domain/entities/category";
import { getSupabaseClient } from "../database/supabase.client";
import type { Database } from "@/domain/dto/database.types.d.ts";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export class CategoryRepository implements ICategoryRepository {
  private supabase = getSupabaseClient();

  private mapRowToEntity(row: CategoryRow): Category {
    return new Category({
      id: row.id,
      name: row.name,
      classification: row.classification as CategoryProps["classification"],
      teamId: row.team_id!,
      createdAt: new Date(row.created_at),
    });
  }

  private mapEntityToRow(
    entity: Category
  ): Omit<CategoryRow, "id" | "created_at"> {
    return {
      name: entity.name,
      classification: entity.classification,
      team_id: entity.teamId,
    };
  }

  async findByTeamId(teamId: string): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from("categories")
      .select("*")
      .eq("team_id", teamId)
      .order("name");

    if (error) throw new Error(error.message);
    return (data || []).map(this.mapRowToEntity);
  }

  async findById(categoryId: string, teamId: string): Promise<Category | null> {
    const { data, error } = await this.supabase
      .from("categories")
      .select("*")
      .eq("id", categoryId)
      .eq("team_id", teamId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? this.mapRowToEntity(data) : null;
  }

  async create(category: Category): Promise<Category> {
    const row = this.mapEntityToRow(category);
    const { data, error } = await this.supabase
      .from("categories")
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

  async update(category: Category): Promise<Category> {
    const row = this.mapEntityToRow(category);
    const { data, error } = await this.supabase
      .from("categories")
      .update(row)
      .eq("id", category.id)
      .eq("team_id", category.teamId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapRowToEntity(data);
  }

  async delete(categoryId: string, teamId: string): Promise<void> {
    const { error } = await this.supabase
      .from("categories")
      .delete()
      .eq("id", categoryId)
      .eq("team_id", teamId);

    if (error) throw new Error(error.message);
  }

  async createDefaultCategories(teamId: string): Promise<Category[]> {
    const defaultCategories = [
      { name: "Moradia", classification: "necessidades" as const },
      { name: "Transporte", classification: "necessidades" as const },
      { name: "Alimentação", classification: "necessidades" as const },
      { name: "Lazer", classification: "desejos" as const },
      { name: "Saúde", classification: "necessidades" as const },
      { name: "Investimentos", classification: "poupanca" as const },
      { name: "Outros", classification: "necessidades" as const },
    ];

    const categoriesToInsert = defaultCategories.map((cat) => ({
      ...cat,
      team_id: teamId,
    }));

    const { data, error } = await this.supabase
      .from("categories")
      .insert(categoriesToInsert)
      .select();

    if (error) throw new Error(error.message);
    return (data || []).map(this.mapRowToEntity);
  }
}
