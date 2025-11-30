import type { IAiService } from "@/domain/interfaces/ai-service.interface";
import type { ReceiptDataDTO } from "@/domain/dto/ai.types.d.ts";

export class ParseReceiptUseCase {
  constructor(private aiService: IAiService) {}

  async execute(file: File): Promise<ReceiptDataDTO | null> {
    const MAX_SIZE = 8 * 1024 * 1024; // 8MB
    if (file.size > MAX_SIZE) {
      throw new Error("Este arquivo excede o limite de 8MB.");
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      throw new Error("Formato de arquivo não suportado.");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return await this.aiService.parseReceipt(buffer, file.type);
  }
}