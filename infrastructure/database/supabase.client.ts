import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/domain/dto/database.types.d.ts";
import { env } from "@/lib/env";

let supabase: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseClient() {
  if (!supabase) {
    supabase = createBrowserClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }

  return supabase;
}
