import { getSupabaseClient } from "../database/supabase.server";
import { LIMITS } from "@/lib/config/limits";

export class RateLimitService {
  async checkLimit(teamId: string): Promise<boolean> {
    const supabase = await getSupabaseClient();
    const now = new Date();
    const windowStart = new Date(
      now.getTime() - LIMITS.RATE_LIMIT_WINDOW_SECONDS * 1000
    );

    // 1. Get current usage
    const { data: record, error } = await supabase
      .from("rate_limits")
      .select("*")
      .eq("team_id", teamId)
      .maybeSingle();

    if (error) {
      console.error("Rate limit check error:", error);
      // Fail open to avoid blocking legitimate users on DB error
      return true;
    }

    if (!record) {
      // First request
      await supabase.from("rate_limits").insert({
        team_id: teamId,
        count: 1,
        window_start: now.toISOString(),
      });
      return true;
    }

    const recordWindowStart = new Date(record.window_start);

    if (recordWindowStart < windowStart) {
      // Window expired, reset
      await supabase
        .from("rate_limits")
        .update({
          count: 1,
          window_start: now.toISOString(),
        })
        .eq("team_id", teamId);
      return true;
    }

    // Within window
    if (record.count >= LIMITS.RATE_LIMIT_MAX_REQUESTS) {
      return false;
    }

    // Increment
    await supabase
      .from("rate_limits")
      .update({
        count: record.count + 1,
      })
      .eq("team_id", teamId);

    return true;
  }
}
