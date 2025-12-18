import type { ReceiptDataDTO } from "@/domain/dto/receipt.dto";
import type { Expense } from "@/domain/entities/expense";
import type {
  PromptContext,
  PromptExecutionResult,
} from "@/domain/ai/prompt-context";

export interface PromptExecutionOptions {
  version?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface IAiService {
  // Existing methods (backward compatibility)
  parseReceipt(
    fileBuffer: Buffer,
    mimeType: string,
    categories?: string[]
  ): Promise<ReceiptDataDTO | null>;
  generateWeeklyInsight(expenses: Expense[]): Promise<string>;

  // New prompt-based execution
  executePrompt<T>(
    promptId: string,
    context: PromptContext,
    options?: PromptExecutionOptions
  ): Promise<PromptExecutionResult<T>>;
}
