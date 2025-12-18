/**
 * Context for dynamic prompt variable injection
 * Used to pass runtime data into prompt templates
 */
export interface PromptContext {
  [key: string]: unknown;
}

/**
 * Result of a prompt execution including metadata for observability
 */
export interface PromptExecutionResult<T = unknown> {
  output: T;
  metadata: PromptExecutionMetadata;
}

/**
 * Metadata tracked for each prompt execution
 * Used for monitoring, debugging, and analytics
 */
export interface PromptExecutionMetadata {
  promptId: string;
  promptVersion: string;
  executionTime: number;
  tokensUsed?: number;
  model: string;
  timestamp: Date;
  success: boolean;
}
