import type { PromptTemplate } from "@/domain/ai/prompt-template";

/**
 * Repository interface for managing AI prompts
 * Supports versioning and environment-based filtering
 */
export interface IPromptRepository {
  /**
   * Get a specific prompt by ID
   * @param id - Unique prompt identifier
   * @param version - Optional semantic version (e.g., "1.0.0", "1.x", "^1.2.0")
   * @returns Prompt template (latest version if version not specified)
   */
  getPrompt(id: string, version?: string): Promise<PromptTemplate>;

  /**
   * List all available prompts, optionally filtered by tags
   * @param tags - Optional array of tags to filter by
   */
  listPrompts(tags?: string[]): Promise<PromptTemplate[]>;

  /**
   * Get prompts for a specific environment
   * @param env - Environment tag (production, staging, development)
   */
  getPromptsByEnvironment(
    env: "production" | "staging" | "development"
  ): Promise<PromptTemplate[]>;
}
