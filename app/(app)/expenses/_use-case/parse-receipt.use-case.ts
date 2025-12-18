import type { IAiService } from "@/domain/interfaces/ai-service.interface";
import type { ReceiptDataDTO } from "@/domain/dto/ai.types.d.ts";

import type { AnalyticsService } from "@/domain/interfaces/analytics-service.interface";

export class ParseReceiptUseCase {
  constructor(
    private aiService: IAiService,
    private analyticsService: AnalyticsService
  ) {}

  async execute(
    file: File,
    userId: string,
    categories?: string[]
  ): Promise<ReceiptDataDTO | null> {
    const MAX_SIZE = 8 * 1024 * 1024; // 8MB
    if (file.size > MAX_SIZE) {
      throw new Error("Esse arquivo é muito grande (limite 8MB).");
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

    // Pass categories to AI service for better suggestions
    const result = await this.aiService.parseReceipt(
      buffer,
      file.type,
      categories
    );

    // Track analytics
    if (result) {
      await this.analyticsService.track(userId, "feature_used", {
        feature: "ai_receipt",
        success: true,
      });
    }

    return result;
  }
}
