"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useEffect } from "react";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "/ingest",
        capture_pageview: false, // Manual control if needed, keeping it light
        ui_host: "https://us.posthog.com",
      });
    }
  }, []);

  return (
    <PostHogProvider client={posthog}>
      {children}
      <SpeedInsights />
    </PostHogProvider>
  );
}
