import { AnalyticsService } from "@/domain/interfaces/analytics-service.interface";
import { PostHog } from "posthog-node";

export class PostHogAnalyticsService implements AnalyticsService {
  private client: PostHog | null = null;

  constructor(apiKey: string, host: string = "https://us.posthog.com") {
    if (apiKey) {
      this.client = new PostHog(apiKey, { host });
    } else {
      console.warn("PostHog API Key not found. Analytics disabled.");
    }
  }

  async identify(userId: string, traits?: Record<string, any>): Promise<void> {
    if (!this.client) return;
    try {
      this.client.identify({
        distinctId: userId,
        properties: traits,
      });
    } catch (error) {
      // Silent fail
      console.error("Analytics Error (Identify):", error);
    }
  }

  async track(
    userId: string,
    event: string,
    properties?: Record<string, any>
  ): Promise<void> {
    if (!this.client) return;
    try {
      this.client.capture({
        distinctId: userId,
        event,
        properties,
      });
    } catch (error) {
      // Silent fail
      console.error("Analytics Error (Track):", error);
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
