export interface AnalyticsService {
  identify(userId: string, traits?: Record<string, any>): Promise<void>;
  track(
    userId: string,
    event: string,
    properties?: Record<string, any>
  ): Promise<void>;
  shutdown(): Promise<void>;
}
