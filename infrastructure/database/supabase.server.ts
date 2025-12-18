import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/domain/dto/database.types.d.ts";
import { env } from "@/lib/env";

export const getSupabaseClient = async () => {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
};

export const getSupabaseAdminClient = () => {
  if (typeof window !== "undefined") {
    throw new Error("Admin client can only be created on the server");
  }

  const adminKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!adminKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured. Admin operations are disabled."
    );
  }

  return createServerClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, adminKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {},
    },
  });
};
