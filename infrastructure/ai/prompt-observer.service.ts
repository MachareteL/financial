import type { AnalyticsService } from "@/domain/interfaces/analytics-service.interface";
import type { PromptExecutionMetadata } from "@/domain/ai/prompt-context";

/**
 * Service for observing and tracking AI prompt executions
 * Integrates with analytics to provide insights on prompt performance
 */
export class PromptObserverService {
  constructor(private analyticsService: AnalyticsService) {}

  /**
   * Track a prompt execution event
   * Records metadata to analytics for monitoring and debugging
   */
  trackExecution(metadata: PromptExecutionMetadata): void {
    this.analyticsService.track("system", "ai_prompt_executed", {
      promptId: metadata.promptId,
      promptVersion: metadata.promptVersion,
      executionTime: metadata.executionTime,
      model: metadata.model,
      success: metadata.success,
      timestamp: metadata.timestamp.toISOString(),
      tokensUsed: metadata.tokensUsed,
    });
  }

  /**
   * Track a prompt execution failure
   */
  trackFailure(
    promptId: string,
    promptVersion: string,
    error: Error,
    executionTime: number
  ): void {
    this.analyticsService.track("system", "ai_prompt_failed", {
      promptId,
      promptVersion,
      error: error.message,
      executionTime,
      timestamp: new Date().toISOString(),
    });
  }
}
