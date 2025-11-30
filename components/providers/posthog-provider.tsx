"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";
import PostHogPageView from "./posthog-pageview";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
      const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

      if (key && host) {
        posthog.init(key, {
          api_host: host,
          person_profiles: "identified_only",
          capture_pageleave: true,
        });
      }
    }
  }, []);

  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PHProvider>
  );
}
