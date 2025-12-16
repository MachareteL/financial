import type { ReceiptDataDTO } from "@/domain/dto/receipt.dto";
import type { Expense } from "@/domain/entities/expense";

export interface IAiService {
  parseReceipt(
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<ReceiptDataDTO | null>;
  generateWeeklyInsight(expenses: Expense[]): Promise<string>;
}
