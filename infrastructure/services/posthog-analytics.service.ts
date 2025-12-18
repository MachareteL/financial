import { AnalyticsService } from "@/domain/interfaces/analytics-service.interface";
import { PostHog } from "posthog-node";

export class PostHogAnalyticsService implements AnalyticsService {
  private client: PostHog | null = null;
  private isConfigured: boolean = false;

  constructor(apiKey?: string, host: string = "https://us.posthog.com") {
    if (typeof window !== "undefined") {
      throw new Error(
        "PostHogAnalyticsService can only be initialized on the server"
      );
    }

    if (apiKey) {
      this.client = new PostHog(apiKey, { host });
      this.isConfigured = true;
    } else {
      console.warn(
        "PostHog API Key not configured. Server-side analytics disabled."
      );
      this.isConfigured = false;
    }
  }

  async identify(
    userId: string,
    traits?: Record<string, unknown>
  ): Promise<void> {
    if (!this.isConfigured || !this.client) return;
    try {
      this.client.identify({
        distinctId: userId,
        properties: traits,
      });
    } catch (error) {
      // Silent fail - analytics should never break the app
      if (process.env.NODE_ENV === "development") {
        console.error("Analytics Error (Identify):", error);
      }
    }
  }

  async track(
    userId: string,
    event: string,
    properties?: Record<string, unknown>
  ): Promise<void> {
    if (!this.isConfigured || !this.client) return;
    try {
      this.client.capture({
        distinctId: userId,
        event,
        properties,
      });
    } catch (error) {
      // Silent fail - analytics should never break the app
      if (process.env.NODE_ENV === "development") {
        console.error("Analytics Error (Track):", error);
      }
    }
  }

  async shutdown(): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.shutdown();
    } catch (error) {
      console.error("Analytics Error (Shutdown):", error);
    }
  }
}
