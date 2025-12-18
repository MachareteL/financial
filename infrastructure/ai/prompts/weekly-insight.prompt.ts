import type { PromptTemplate } from "@/domain/ai/prompt-template";

/**
 * Prompt for generating weekly financial insights
 *
 * Context variables:
 * - totalSpent: Total amount spent in the week (formatted as R$ X.XX)
 * - topCategories: String with top 3 categories and amounts
 * - topExpenses: String with top 5 individual expenses
 *
 * Output: Plain text insight message (2 sentences max)
 */
export const weeklyInsightPrompt: PromptTemplate = {
  id: "weekly-insight",
  name: "Weekly Financial Insight Generation",
  version: "1.0.0",
  description:
    "Gera insights curtos e motivadores sobre gastos semanais de um usuário",
  template: `
Atue como um Coach Financeiro amigável e motivador.
Analise o resumo financeiro desta semana do usuário e gere um "Insight" curto, direto e útil (máximo 2 frases).
Foque em elogiar economia ou alertar gentilmente sobre gastos excessivos em uma categoria específica.
Não use saudações genéricas como "Olá". Vá direto ao ponto. Use emojis.

Devolva APENAS a mensagem em texto puro.

Resumo da Semana:
- Total Gasto: {{totalSpent}}

Principais Categorias:
{{topCategories}}

Maiores Gastos Individuais:
{{topExpenses}}
  `.trim(),
  variables: ["totalSpent", "topCategories", "topExpenses"],
  metadata: {
    author: "system",
    createdAt: new Date("2024-12-16"),
    tags: ["production", "insight", "text"],
    model: "gemini-2.5-flash",
    temperature: 0.7,
  },
};
