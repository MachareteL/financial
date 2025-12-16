import type { IIncomeRepository } from "@/domain/interfaces/income.repository.interface";
import { Income } from "@/domain/entities/income";
import { DateUtils } from "@/domain/utils/date.utils";
import { getSupabaseClient } from "../database/supabase.client";
import type { Database } from "@/domain/dto/database.types.d.ts";

type IncomeRow = Database["public"]["Tables"]["incomes"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

type IncomeRowWithProfile = IncomeRow & {
  profiles: Pick<ProfileRow, "name"> | null;
};

import type { SupabaseClient } from "@supabase/supabase-js";

export class IncomeRepository implements IIncomeRepository {
  constructor(private readonly supabase: SupabaseClient) {}
  private mapRowToEntity(row: IncomeRowWithProfile): Income {
    return new Income({
      id: row.id,
      amount: row.amount,
      description: row.description,
      type: row.type as "recurring" | "one_time",
      frequency: row.frequency as "monthly" | "weekly" | "yearly" | null,
      date: DateUtils.parse(row.date) || DateUtils.now(),
      teamId: row.team_id!,
      userId: row.user_id!,
      createdAt: DateUtils.parse(row.created_at) || DateUtils.now(),
      // owner: row.profiles?.name || null, // Removed as it's not in the Income entity interface apparently, or needs to be added
    });
  }

  private mapEntityToRow(entity: Income): Omit<IncomeRow, "created_at"> {
    return {
      id: entity.id,
      amount: entity.amount,
      description: entity.description || null,
      type: entity.type,
      frequency: entity.frequency || null,
      date: entity.date.toISOString().split("T")[0], // Formata 'YYYY-MM-DD'
      team_id: entity.teamId,
      user_id: entity.userId,
    };
  }

  async create(income: Income): Promise<Income> {
    const row = this.mapEntityToRow(income);
    const { data, error } = await this.supabase
      .from("incomes")
      .insert({
        ...row,
        created_at: income.createdAt.toISOString(),
      })
      .select(`*, profiles ( name )`)
      .single();

    if (error) throw new Error(error.message);
    return this.mapRowToEntity(data as IncomeRowWithProfile);
  }

  async update(income: Income): Promise<Income> {
    const row = this.mapEntityToRow(income);

    const { data, error } = await this.supabase
      .from("incomes")
      .update(row)
      .eq("id", income.id)
      .eq("team_id", income.teamId)
      .select(`*, profiles ( name )`)
      .single();

    if (error) throw new Error(error.message);
    return this.mapRowToEntity(data as IncomeRowWithProfile);
  }

  async delete(id: string, teamId: string): Promise<void> {
    const { error } = await this.supabase
      .from("incomes")
      .delete()
      .eq("id", id)
      .eq("team_id", teamId);

    if (error) throw new Error(error.message);
  }

  async findById(id: string, teamId: string): Promise<Income | null> {
    const { data, error } = await this.supabase
      .from("incomes")
      .select(`*, profiles ( name )`)
      .eq("id", id)
      .eq("team_id", teamId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    return this.mapRowToEntity(data as IncomeRowWithProfile);
  }

  async findByTeamId(teamId: string): Promise<Income[]> {
    const { data, error } = await this.supabase
      .from("incomes")
      .select(`*, profiles ( name )`)
      .eq("team_id", teamId)
      .order("date", { ascending: false });

    if (error) throw new Error(error.message);
    if (!data) return [];

    return data.map((row) => this.mapRowToEntity(row as IncomeRowWithProfile));
  }
}
