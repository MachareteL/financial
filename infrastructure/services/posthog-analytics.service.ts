import type { PostHog } from "posthog-node";
import { IAnalyticsService } from "@/domain/interfaces/analytics-service.interface";

export class PostHogAnalyticsService implements IAnalyticsService {
  private client: PostHog | null = null;
  private initialized = false;

  private async getClient(): Promise<PostHog | null> {
    if (this.initialized) return this.client;

    // Ensure we are on the server
    if (typeof window !== "undefined") {
      this.initialized = true;
      return null;
    }

    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

    if (apiKey && host) {
      try {
        const { PostHog } = await import("posthog-node");
        this.client = new PostHog(apiKey, {
          host,
          flushAt: 1,
          flushInterval: 0,
        });
      } catch (error) {
        console.error("Failed to load posthog-node:", error);
      }
    } else {
      console.warn("PostHog not initialized: Missing API Key or Host");
    }

    this.initialized = true;
    return this.client;
  }

  async identify(userId: string, traits?: Record<string, any>): Promise<void> {
    const client = await this.getClient();
    if (!client) return;

    try {
      client.identify({
        distinctId: userId,
        properties: traits,
      });
    } catch (error) {
      console.error("PostHog identify error:", error);
    }
  }

  async track(
    userId: string,
    event: string,
    properties?: Record<string, any>
  ): Promise<void> {
    const client = await this.getClient();
    if (!client) return;

    try {
      client.capture({
        distinctId: userId,
        event,
        properties,
      });
    } catch (error) {
      console.error("PostHog track error:", error);
    }
  }

  async group(
    groupType: string,
    groupKey: string,
    properties?: Record<string, any>
  ): Promise<void> {
    const client = await this.getClient();
    if (!client) return;

    try {
      client.groupIdentify({
        groupType,
        groupKey,
        properties,
      });
    } catch (error) {
      console.error("PostHog group error:", error);
    }
  }

  async shutdown(): Promise<void> {
    if (this.client) {
      await this.client.shutdown();
    }
  }
}
