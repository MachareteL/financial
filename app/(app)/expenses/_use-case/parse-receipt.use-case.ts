import type { IAiService } from "@/domain/interfaces/ai-service.interface";
import type { ReceiptDataDTO } from "@/domain/dto/ai.types.d.ts";

import type { IAnalyticsService } from "@/domain/interfaces/analytics-service.interface";

export class ParseReceiptUseCase {
  constructor(
    private aiService: IAiService,
    private analyticsService: IAnalyticsService
  ) {}

  async execute(file: File, userId: string): Promise<ReceiptDataDTO | null> {
    const start = Date.now();
    const MAX_SIZE = 8 * 1024 * 1024; // 8MB
    if (file.size > MAX_SIZE) {
      throw new Error("Este arquivo excede o limite de 8MB.");
    }

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!validTypes.includes(file.type)) {
      throw new Error("Formato de arquivo não suportado.");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let success = false;
    try {
      const result = await this.aiService.parseReceipt(buffer, file.type);
      success = !!result;
      return result;
    } finally {
      // Fire-and-forget analytics
      this.analyticsService.track(userId, "receipt_scanned", {
        success,
        execution_time_ms: Date.now() - start,
        is_trial: false,
      });
    }
  }
}
