import { AnalyticsService } from "@/domain/interfaces/analytics-service.interface";
import posthog from "posthog-js";

export class ClientAnalyticsService implements AnalyticsService {
  async identify(userId: string, traits?: Record<string, any>): Promise<void> {
    try {
      posthog.identify(userId, traits);
    } catch (error) {
      console.error("Analytics Error (Identify):", error);
    }
  }

  async track(
    userId: string,
    event: string,
    properties?: Record<string, any>
  ): Promise<void> {
    try {
      // posthog-js automatically handles the user ID if identified,
      // but we can pass it explicitly or just rely on the session.
      // The interface requires userId, but posthog.capture doesn't strictly need it if identified.
      // We'll just pass the event and properties.
      posthog.capture(event, properties);
    } catch (error) {
      console.error("Analytics Error (Track):", error);
    }
  }

  async shutdown(): Promise<void> {
    // No-op for client
  }
}
