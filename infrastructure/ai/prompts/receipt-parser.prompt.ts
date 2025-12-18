import type { PromptTemplate } from "@/domain/ai/prompt-template";

/**
 * Prompt for extracting structured data from receipt images
 *
 * Context variables:
 * - categories: Array of available category names to suggest from
 *
 * Output: JSON with { amount, date, description, category }
 */
export const receiptParserPrompt: PromptTemplate = {
  id: "receipt-parser",
  name: "Receipt Data Extraction",
  version: "1.1.0",
  description:
    "Extrai dados estruturados de notas fiscais com sugestão de categoria baseada nas categorias existentes do usuário",
  template: `
Analise esta imagem de nota fiscal e extraia os dados em JSON estrito:
- "amount": valor total (number).
- "date": data da compra (YYYY-MM-DD). Se não houver ano, assuma o ano atual.
- "description": nome do estabelecimento.
- "category": sugira UMA das seguintes categorias existentes que melhor se encaixe, ou null se nenhuma for adequada:
{{categories}}

IMPORTANTE: A categoria deve ser EXATAMENTE uma das listadas acima, sem modificações.
  `.trim(),
  variables: ["categories"],
  metadata: {
    author: "system",
    createdAt: new Date("2024-12-16"),
    tags: ["production", "receipt", "vision"],
    model: "gemini-2.5-flash",
    temperature: 0.3,
    responseMimeType: "application/json",
  },
};
