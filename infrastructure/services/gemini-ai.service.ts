import { GoogleGenAI } from "@google/genai";
import type {
  IAiService,
  PromptExecutionOptions,
} from "@/domain/interfaces/ai-service.interface";
import { ReceiptSchema, type ReceiptDataDTO } from "@/domain/dto/receipt.dto";
import type { Expense } from "@/domain/entities/expense";
import type { IPromptRepository } from "@/domain/interfaces/prompt-repository.interface";
import type {
  PromptContext,
  PromptExecutionResult,
} from "@/domain/ai/prompt-context";
import { PromptObserverService } from "../ai/prompt-observer.service";

// Type definitions for Google GenAI content parts
interface InlineDataPart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

interface TextPart {
  text: string;
}

type ContentPart = InlineDataPart | TextPart;

export class GeminiAiService implements IAiService {
  private ai: GoogleGenAI;
  private defaultModelName: string;

  constructor(
    apiKey: string,
    private promptRepository: IPromptRepository,
    private promptObserver: PromptObserverService,
    modelName: string = "gemini-2.5-flash"
  ) {
    this.ai = new GoogleGenAI({ apiKey });
    this.defaultModelName = modelName;
  }

  /**
   * Render a prompt template by replacing variables with context values
   */
  private renderPrompt(template: string, context: PromptContext): string {
    let rendered = template;

    for (const [key, value] of Object.entries(context)) {
      const placeholder = `{{${key}}}`;
      const replacement = typeof value === "string" ? value : String(value);
      rendered = rendered.replace(new RegExp(placeholder, "g"), replacement);
    }

    return rendered;
  }

  /**
   * Execute a prompt by ID with given context
   */
  async executePrompt<T>(
    promptId: string,
    context: PromptContext,
    options?: PromptExecutionOptions
  ): Promise<PromptExecutionResult<T>> {
    const startTime = Date.now();
    let success = false;

    try {
      // Get prompt from repository
      const prompt = await this.promptRepository.getPrompt(
        promptId,
        options?.version
      );

      // Render template with context
      const renderedPrompt = this.renderPrompt(prompt.template, context);

      // Build configuration for the request
      const modelName = prompt.metadata.model || this.defaultModelName;
      const config: Record<string, unknown> = {
        temperature: options?.temperature ?? prompt.metadata.temperature ?? 0.7,
      };

      // Add maxOutputTokens if specified
      if (options?.maxTokens ?? prompt.metadata.maxTokens) {
        config.maxOutputTokens =
          options?.maxTokens ?? prompt.metadata.maxTokens;
      }

      // Add responseMimeType if specified
      if (prompt.metadata.responseMimeType) {
        config.responseMimeType = prompt.metadata.responseMimeType;
      }

      // Build contents array based on context
      let contents: ContentPart[] | string;

      if (context.fileBuffer && context.mimeType) {
        // Vision task with image - use parts array
        const base64Data = (context.fileBuffer as Buffer).toString("base64");
        contents = [
          {
            inlineData: {
              mimeType: context.mimeType as string,
              data: base64Data,
            },
          },
          { text: renderedPrompt },
        ];
      } else {
        // Text-only task
        contents = renderedPrompt;
      }

      // Execute prompt using new SDK API
      const result = await this.ai.models.generateContent({
        model: modelName,
        contents,
        config,
      });

      const responseText = result.text ?? "";
      const executionTime = Date.now() - startTime;

      // Parse output based on response type
      let output: T;
      if (prompt.metadata.responseMimeType === "application/json") {
        output = JSON.parse(responseText) as T;
      } else {
        output = responseText as T;
      }

      success = true;

      const metadata = {
        promptId,
        promptVersion: prompt.version,
        executionTime,
        model: modelName,
        timestamp: new Date(),
        success,
      };

      // Track execution
      this.promptObserver.trackExecution(metadata);

      return { output, metadata };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      // Track failure
      if (error instanceof Error) {
        const prompt = await this.promptRepository.getPrompt(
          promptId,
          options?.version
        );
        this.promptObserver.trackFailure(
          promptId,
          prompt.version,
          error,
          executionTime
        );
      }

      throw error;
    }
  }

  /**
   * Parse receipt using vision AI
   * Context will include user's categories for better suggestion
   */
  async parseReceipt(
    fileBuffer: Buffer,
    mimeType: string,
    categories?: string[]
  ): Promise<ReceiptDataDTO | null> {
    try {
      // Format categories for the prompt
      const categoriesText =
        categories && categories.length > 0
          ? categories.map((c) => `  - ${c}`).join("\n")
          : "  - Alimentação\n  - Transporte\n  - Saúde\n  - Educação\n  - Lazer\n  - Outros";

      const context: PromptContext = {
        fileBuffer,
        mimeType,
        categories: categoriesText,
      };

      const result = await this.executePrompt<Record<string, unknown>>(
        "receipt-parser",
        context
      );

      // Validate and parse with schema
      const rawData = result.output;

      if (typeof rawData.amount === "string") {
        rawData.amount = parseFloat(rawData.amount);
      }

      return ReceiptSchema.parse(rawData);
    } catch (error) {
      console.error("Erro no GeminiAiService.parseReceipt:", error);
      return null;
    }
  }

  /**
   * Generate weekly financial insight
   */
  async generateWeeklyInsight(expenses: Expense[]): Promise<string> {
    try {
      if (expenses.length === 0) {
        return "Você não teve gastos registrados nesta semana. Ótimo momento para planejar seus investimentos! 🚀";
      }

      // 1. Calculate Total Spent
      const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

      // 2. Group by Category
      const categoryTotals: Record<string, number> = {};
      expenses.forEach((e) => {
        const catName = e.category?.name || "Outros";
        categoryTotals[catName] = (categoryTotals[catName] || 0) + e.amount;
      });

      const topCategories = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([name, amount]) => `- ${name}: R$ ${amount.toFixed(2)}`)
        .join("\n");

      // 3. Top Expenses
      const topExpenses = expenses
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)
        .map(
          (e) =>
            `- ${e.description} (${
              e.category?.name || "Outros"
            }): R$ ${e.amount.toFixed(2)}`
        )
        .join("\n");

      const context: PromptContext = {
        totalSpent: `R$ ${totalSpent.toFixed(2)}`,
        topCategories,
        topExpenses,
      };

      const result = await this.executePrompt<string>(
        "weekly-insight",
        context
      );

      return (
        result.output || "Mantenha o foco nos seus objetivos financeiros! 💰"
      );
    } catch (error) {
      console.error("Erro ao gerar insight:", error);
      return "Não foi possível gerar seu insight semanal no momento. Tente novamente mais tarde.";
    }
  }
}
