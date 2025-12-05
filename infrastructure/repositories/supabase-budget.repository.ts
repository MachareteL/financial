import type { IBudgetRepository } from "@/domain/interfaces/budget.repository.interface";
import { Budget } from "@/domain/entities/budget";
import { getSupabaseClient } from "../database/supabase.client";
import type { Database } from "@/domain/dto/database.types.d.ts";

type BudgetRow = Database["public"]["Tables"]["budgets"]["Row"];

import type { SupabaseClient } from "@supabase/supabase-js";

export class BudgetRepository implements IBudgetRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  // 1. MAPEAMENTO: DO BANCO (Row) PARA A ENTIDADE
  private mapRowToEntity(row: BudgetRow): Budget {
    return new Budget({
      id: row.id,
      month: row.month,
      year: row.year,
      totalIncome: row.total_income,
      teamId: row.team_id!,
      createdAt: new Date(row.created_at),
    });
  }

  // 2. MAPEAMENTO: DA ENTIDADE PARA O BANCO (Row)
  private mapEntityToRow(
    entity: Budget
  ): Omit<
    BudgetRow,
    | "id"
    | "created_at"
    | "desejos_budget"
    | "necessidades_budget"
    | "poupanca_budget"
  > {
    return {
      month: entity.month,
      year: entity.year,
      total_income: entity.totalIncome,
      team_id: entity.teamId,
    };
  }

  async create(budget: Budget): Promise<Budget> {
    const row = this.mapEntityToRow(budget);
    const { data, error } = await this.supabase
      .from("budgets")
      .insert({
        ...row,
        id: budget.id,
        created_at: budget.createdAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapRowToEntity(data);
  }

  async update(budget: Budget): Promise<Budget> {
    const row = this.mapEntityToRow(budget);
    const { data, error } = await this.supabase
      .from("budgets")
      .update(row) // Só atualiza o total_income
      .eq("id", budget.id)
      .eq("team_id", budget.teamId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapRowToEntity(data);
  }

  async findByTeamAndPeriod(
    teamId: string,
    month: number,
    year: number
  ): Promise<Budget | null> {
    const { data, error } = await this.supabase
      .from("budgets")
      .select("*")
      .eq("team_id", teamId)
      .eq("month", month)
      .eq("year", year)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    return this.mapRowToEntity(data);
  }
}
