import type { IInvestmentRepository } from "@/domain/interfaces/investment.repository.interface";
import { Investment } from "@/domain/entities/investment";
import { getSupabaseClient } from "../database/supabase.client";
import type { Database } from "@/domain/dto/database.types.d.ts";

type InvestmentRow = Database["public"]["Tables"]["investments"]["Row"];

export class InvestmentRepository implements IInvestmentRepository {
  private mapRowToEntity(row: InvestmentRow): Investment {
    return new Investment({
      id: row.id,
      teamId: row.team_id!,
      name: row.name,
      type: row.type as any,
      initialAmount: row.initial_amount,
      currentAmount: row.current_amount,
      monthlyContribution: row.monthly_contribution || 0,
      annualReturnRate: row.annual_return_rate,
      startDate: new Date(row.start_date),
      createdAt: new Date(row.created_at),
    });
  }

  private mapEntityToRow(
    entity: Investment
  ): Omit<InvestmentRow, "id" | "created_at"> {
    return {
      team_id: entity.teamId,
      name: entity.name,
      type: entity.type,
      initial_amount: entity.initialAmount,
      current_amount: entity.currentAmount,
      monthly_contribution: entity.monthlyContribution,
      annual_return_rate: entity.annualReturnRate,
      start_date: entity.startDate.toISOString().split("T")[0],
    };
  }

  async findByTeamId(teamId: string): Promise<Investment[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("investments")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(this.mapRowToEntity);
  }

  async findById(id: string, teamId: string): Promise<Investment | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("investments")
      .select("*")
      .eq("id", id)
      .eq("team_id", teamId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? this.mapRowToEntity(data) : null;
  }

  async create(investment: Investment): Promise<Investment> {
    const row = this.mapEntityToRow(investment);
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("investments")
      .insert({
        ...row,
        id: investment.id,
        created_at: investment.createdAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapRowToEntity(data);
  }

  async update(investment: Investment): Promise<Investment> {
    const row = this.mapEntityToRow(investment);
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("investments")
      .update(row)
      .eq("id", investment.id)
      .eq("team_id", investment.teamId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapRowToEntity(data);
  }

  async delete(id: string, teamId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("investments")
      .delete()
      .eq("id", id)
      .eq("team_id", teamId);

    if (error) throw new Error(error.message);
  }
}
