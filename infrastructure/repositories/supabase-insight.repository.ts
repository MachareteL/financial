import type { IInsightRepository } from "@/domain/interfaces/insight.repository.interface";
import { Insight } from "@/domain/entities/insight";
import { DateUtils } from "@/domain/utils/date.utils";
import type { SupabaseClient } from "@supabase/supabase-js";

export class SupabaseInsightRepository implements IInsightRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(insight: Insight): Promise<void> {
    const { error } = await this.supabase.from("insights").insert({
      id: insight.id,
      team_id: insight.teamId,
      type: insight.type,
      title: insight.title,
      content: insight.content,
      is_read: insight.isRead,
      action_url: insight.actionUrl,
      created_at: insight.createdAt.toISOString(),
    });

    if (error) {
      throw new Error(`Failed to create insight: ${error.message}`);
    }
  }

  async findPendingByTeamId(teamId: string): Promise<Insight[]> {
    const { data, error } = await this.supabase
      .from("insights")
      .select("*")
      .eq("team_id", teamId)
      .eq("is_read", false)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch pending insights: ${error.message}`);
    }

    return data.map(
      (row) =>
        new Insight({
          id: row.id,
          teamId: row.team_id,
          type: row.type,
          title: row.title,
          content: row.content,
          isRead: row.is_read,
          createdAt: DateUtils.parse(row.created_at) || DateUtils.now(),
          actionUrl: row.action_url,
        })
    );
  }

  async markAsRead(insightId: string): Promise<void> {
    const { error } = await this.supabase
      .from("insights")
      .update({ is_read: true })
      .eq("id", insightId);

    if (error) {
      throw new Error(`Failed to mark insight as read: ${error.message}`);
    }
  }
}
