import { GoogleGenerativeAI } from "@google/generative-ai";
import type { IAiService } from "@/domain/interfaces/ai-service.interface";
import { ReceiptSchema, type ReceiptDataDTO } from "@/domain/entities/receipt";

export class GeminiAiService implements IAiService {
  private model;
  constructor(
    apiKey: string,
    modelName: string = process.env.GOOGLE_GEMINI_MODEL!
  ) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: "application/json" },
    });
  }

  async parseReceipt(
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<ReceiptDataDTO | null> {
    try {
      const base64Data = fileBuffer.toString("base64");

      const prompt = `
        Analise esta imagem de nota fiscal e extraia os dados em JSON estrito:
        - "amount": valor total (number).
        - "date": data da compra (YYYY-MM-DD). Se não houver ano, assuma o ano atual.
        - "description": nome do estabelecimento.
        - "category": sugira uma categoria (Alimentação, Transporte, etc) ou null.
      `;

      const result = await this.model.generateContent([
        prompt,
        { inlineData: { data: base64Data, mimeType } },
      ]);

      const text = result.response.text();
      if (!text) return null;

      const rawData = JSON.parse(text);

      if (typeof rawData.amount === "string") {
        rawData.amount = parseFloat(rawData.amount);
      }

      return ReceiptSchema.parse(rawData);
    } catch (error) {
      console.error("Erro no GeminiAiService:", error);
      return null;
    }
  }
}
