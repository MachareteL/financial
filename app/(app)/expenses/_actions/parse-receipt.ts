"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ReceiptData {
  amount?: number;
  date?: string; // YYYY-MM-DD
  description?: string;
  category?: string; // Sugestão de categoria
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function parseReceiptAction(
  formData: FormData
): Promise<ReceiptData | null> {
  const file = formData.get("file") as File;

  // Validação básica
  if (!file || file.size === 0) {
    return null;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }, // Força saída JSON
    });

    // 3. Prompt Otimizado
    const prompt = `
      Analise esta imagem de nota fiscal/recibo e extraia os seguintes dados em formato JSON estrito:
      - "amount": O valor total da compra (número float, ex: 120.50).
      - "date": A data da compra no formato ISO "YYYY-MM-DD". Se não achar o ano, assuma o ano atual.
      - "description": O nome do estabelecimento ou uma descrição curta do que é (ex: "Uber", "Supermercado XYZ").
      
      Se algum campo não for encontrado, retorne null para ele.
    `;

    // 4. Execução
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      },
    ]);

    const response = await result.response;

    const text = await response.text();

    if (!text) return null;

    const data = JSON.parse(text) as ReceiptData;

    if (typeof data.amount === "string") {
      data.amount = parseFloat(data.amount);
    }

    return data;
  } catch (error) {
    console.error("Erro ao processar nota com Gemini:", error);
    return null;
  }
}
