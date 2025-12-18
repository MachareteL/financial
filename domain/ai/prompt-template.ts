/**
 * Core types for AI Prompt Management
 * Following Clean Architecture principles - these are domain entities
 */

export interface PromptTemplate {
  id: string;
  name: string;
  version: string;
  description: string;
  template: string;
  variables: string[];
  metadata: PromptMetadata;
}

export interface PromptMetadata {
  author: string;
  createdAt: Date;
  tags: string[];
  model: string;
  temperature?: number;
  maxTokens?: number;
  responseMimeType?: string;
}

export interface PromptExecutionOptions {
  version?: string;
  temperature?: number;
  maxTokens?: number;
}
