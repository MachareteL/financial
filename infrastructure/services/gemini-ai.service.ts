import { GoogleGenerativeAI } from "@google/generative-ai";
import type { IAiService } from "@/domain/interfaces/ai-service.interface";
import { ReceiptSchema, type ReceiptDataDTO } from "@/domain/dto/receipt.dto";
import type { Expense } from "@/domain/entities/expense";

export class GeminiAiService implements IAiService {
  private model;
  private textModel;

  constructor(apiKey: string, modelName: string = "gemini-2.5-flash") {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: "application/json" },
    });
    this.textModel = genAI.getGenerativeModel({
      model: modelName,
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

  async generateWeeklyInsight(expenses: Expense[]): Promise<string> {
    try {
      if (expenses.length === 0) {
        return "Você não teve gastos registrados nesta semana. Ótimo momento para planejar seus investimentos! 🚀";
      }

      const expensesSummary = expenses
        .map(
          (e) =>
            `- ${e.description} (${e.category?.name || "Outros"}): R$ ${e.amount.toFixed(2)}`
        )
        .join("\n");

      const prompt = `
        Atue como um Coach Financeiro amigável e motivador.
        Analise os gastos desta semana do usuário a seguir e gere um "Insight" curto, direto e útil (máximo 2 frases).
        Foque em elogiar economia ou alertar gentilmente sobre gastos excessivos em uma categoria específica.
        Não use saudações genéricas como "Olá". Vá direto ao ponto. Use emojis.

        Devolva uma mensagem plain text.
        
        Gastos:
        ${expensesSummary}
      `;

      const result = await this.textModel.generateContent(prompt);
      const text = result.response.text();
      return text || "Mantenha o foco nos seus objetivos financeiros! 💰";
    } catch (error) {
      console.error("Erro ao gerar insight:", error);
      return "Não foi possível gerar sue insight semanal no momento. Tente novamente mais tarde.";
    }
  }
}
