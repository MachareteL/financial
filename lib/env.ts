import { z } from "zod";

/**
 * Client-side environment variables (NEXT_PUBLIC_* only)
 * These are embedded in the browser bundle and are safe to use in client components
 */
const clientEnvSchema = z.object({
  // Supabase (Required)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "Supabase Anon Key is required"),

  // Stripe (Optional)
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),

  // URLs (Optional with default)
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),

  // PostHog (Optional)
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
});

/**
 * Server-side environment variables (without NEXT_PUBLIC_ prefix)
 * These are ONLY available on the server and will be undefined in the browser
 */
const serverEnvSchema = z.object({
  // Stripe Server Keys
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Supabase Admin
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // Cron
  CRON_SECRET: z.string().optional(),

  // Google AI (note: in your .env.local it's GOOGLE_API_KEY, not GOOGLE_GENAI_API_KEY)
  GOOGLE_API_KEY: z.string().optional(),

  // Resend
  RESEND_API_KEY: z.string().optional(),

  // PostHog Server
  POSTHOG_API_KEY: z.string().optional(),
  POSTHOGKEY: z.string().optional(),
});

// Validate client env (always runs)
const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
});

// Validate server env (only on server-side)
const serverEnv =
  typeof window === "undefined"
    ? serverEnvSchema.parse({
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
        CRON_SECRET: process.env.CRON_SECRET,
        GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        POSTHOG_API_KEY: process.env.POSTHOG_API_KEY,
        POSTHOGKEY: process.env.POSTHOGKEY,
      })
    : ({} as z.infer<typeof serverEnvSchema>);

/**
 * Validated and typed environment variables
 * Use this instead of process.env for type safety and runtime validation
 *
 * NOTE: Server-only variables will be undefined in the browser!
 * Use serverEnv for server-only code or check typeof window === "undefined"
 */
export const env = {
  ...clientEnv,
  ...serverEnv,
  // Provide safe defaults for server vars when in browser
  get CRON_SECRET() {
    return typeof window === "undefined" ? serverEnv.CRON_SECRET : undefined;
  },
  get STRIPE_SECRET_KEY() {
    return typeof window === "undefined"
      ? serverEnv.STRIPE_SECRET_KEY
      : undefined;
  },
  get STRIPE_WEBHOOK_SECRET() {
    return typeof window === "undefined"
      ? serverEnv.STRIPE_WEBHOOK_SECRET
      : undefined;
  },
  get SUPABASE_SERVICE_ROLE_KEY() {
    return typeof window === "undefined"
      ? serverEnv.SUPABASE_SERVICE_ROLE_KEY
      : undefined;
  },
  get GOOGLE_API_KEY() {
    return typeof window === "undefined" ? serverEnv.GOOGLE_API_KEY : undefined;
  },
  get RESEND_API_KEY() {
    return typeof window === "undefined" ? serverEnv.RESEND_API_KEY : undefined;
  },
  get POSTHOG_API_KEY() {
    return typeof window === "undefined"
      ? serverEnv.POSTHOG_API_KEY
      : undefined;
  },
};

/**
 * Type-safe environment variable access
 */
export type Env = typeof env;
