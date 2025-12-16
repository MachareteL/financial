"use server";

import {
  getGetPendingInsightsUseCase,
  getMarkInsightAsReadUseCase,
  getGenerateWeeklyReportUseCase,
} from "@/infrastructure/dependency-injection/server-container";

// Use DTOs if possible, or return plain objects. Insight entity might need serialization.
// Assuming Insight entity is serializable (it has public props).

export async function getPendingInsightsAction(teamId: string): Promise<any[]> {
  try {
    const useCase = await getGetPendingInsightsUseCase();
    const insights = await useCase.execute(teamId);
    // Serialize to plain objects to avoid "Server Actions must return plain objects" error if Insight is a class
    return insights.map((i) => ({
      id: i.id,
      teamId: i.teamId,
      type: i.type,
      title: i.title,
      content: i.content,
      isRead: i.isRead,
      createdAt: i.createdAt,
      actionUrl: i.actionUrl,
    }));
  } catch (error) {
    console.error("Failed to get pending insights:", error);
    throw new Error("Falha ao buscar insights.");
  }
}

export async function markInsightAsReadAction(
  insightId: string
): Promise<void> {
  try {
    const useCase = await getMarkInsightAsReadUseCase();
    await useCase.execute(insightId);
  } catch (error) {
    console.error("Failed to mark insight as read:", error);
    throw new Error("Falha ao marcar insight como lido.");
  }
}

export async function generateWeeklyReportAction(
  userId: string,
  teamId: string
): Promise<void> {
  try {
    const useCase = await getGenerateWeeklyReportUseCase();
    await useCase.execute(teamId);
  } catch (error) {
    console.error("Failed to generate weekly report:", error);
    throw new Error("Falha ao gerar o resumo semanal.");
  }
}
