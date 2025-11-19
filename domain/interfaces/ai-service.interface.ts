import type { ReceiptDataDTO } from "@/domain/dto/ai.types";

export interface IAiService {
  parseReceipt(fileBuffer: Buffer, mimeType: string): Promise<ReceiptDataDTO | null>;
}