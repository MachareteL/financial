export interface IAnalyticsService {
  identify(userId: string, traits?: Record<string, any>): Promise<void>;
  track(
    userId: string,
    event: string,
    properties?: Record<string, any>
  ): Promise<void>;
  group(
    groupType: string,
    groupKey: string,
    properties?: Record<string, any>
  ): Promise<void>;
  shutdown(): Promise<void>;
}
