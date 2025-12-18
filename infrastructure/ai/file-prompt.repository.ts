import type { IPromptRepository } from "@/domain/interfaces/prompt-repository.interface";
import type { PromptTemplate } from "@/domain/ai/prompt-template";
import * as prompts from "./prompts";

/**
 * File-based prompt repository implementation
 * Loads prompts from TypeScript files in the prompts directory
 * Supports semantic versioning and environment-based filtering
 */
export class FilePromptRepository implements IPromptRepository {
  private prompts: Map<string, PromptTemplate[]>;

  constructor() {
    this.prompts = new Map();
    this.loadPrompts();
  }

  /**
   * Load all prompts from the prompts directory
   * Groups prompts by ID and sorts by version (descending)
   */
  private loadPrompts(): void {
    const allPrompts = Object.values(prompts) as PromptTemplate[];

    for (const prompt of allPrompts) {
      const existing = this.prompts.get(prompt.id) || [];
      existing.push(prompt);
      this.prompts.set(prompt.id, existing);
    }

    // Sort each prompt group by version (descending - latest first)
    for (const [id, versions] of this.prompts.entries()) {
      versions.sort((a, b) => this.compareVersions(b.version, a.version));
      this.prompts.set(id, versions);
    }
  }

  /**
   * Compare semantic versions
   * Returns: 1 if a > b, -1 if a < b, 0 if equal
   */
  private compareVersions(a: string, b: string): number {
    const aParts = a.split(".").map(Number);
    const bParts = b.split(".").map(Number);

    for (let i = 0; i < 3; i++) {
      if (aParts[i] > bParts[i]) return 1;
      if (aParts[i] < bParts[i]) return -1;
    }
    return 0;
  }

  /**
   * Get a prompt by ID and optional version
   * If version not specified, returns the latest version
   */
  async getPrompt(id: string, version?: string): Promise<PromptTemplate> {
    const versions = this.prompts.get(id);

    if (!versions || versions.length === 0) {
      throw new Error(`Prompt com ID "${id}" não encontrado`);
    }

    if (!version) {
      // Return latest version
      return versions[0];
    }

    // Find exact version match
    const match = versions.find((p) => p.version === version);
    if (!match) {
      throw new Error(
        `Prompt "${id}" versão "${version}" não encontrada. Versões disponíveis: ${versions.map((v) => v.version).join(", ")}`
      );
    }

    return match;
  }

  /**
   * List all prompts, optionally filtered by tags
   */
  async listPrompts(tags?: string[]): Promise<PromptTemplate[]> {
    const allPrompts: PromptTemplate[] = [];

    // Get latest version of each prompt
    for (const versions of this.prompts.values()) {
      if (versions.length > 0) {
        allPrompts.push(versions[0]);
      }
    }

    if (!tags || tags.length === 0) {
      return allPrompts;
    }

    // Filter by tags
    return allPrompts.filter((prompt) =>
      tags.some((tag) => prompt.metadata.tags.includes(tag))
    );
  }

  /**
   * Get prompts for a specific environment
   */
  async getPromptsByEnvironment(
    env: "production" | "staging" | "development"
  ): Promise<PromptTemplate[]> {
    return this.listPrompts([env]);
  }
}
