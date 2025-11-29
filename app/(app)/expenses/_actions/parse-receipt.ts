"use server";

import {
  parseReceiptUseCase,
  checkFeatureAccessUseCase,
  verifyTeamPermissionUseCase,
  rateLimitService,
} from "@/infrastructure/dependency-injection/server-container";
import { getSupabaseClient } from "@/infrastructure/database/supabase.server";
import type { ReceiptDataDTO } from "@/domain/entities/receipt";

export async function parseReceiptAction(
  formData: FormData
): Promise<ReceiptDataDTO | null> {
  const file = formData.get("file") as File;
  const teamId = formData.get("teamId") as string;

  if (!file || file.size === 0) return null;

  // --- GATEKEEPER VALIDATION ---
  if (!teamId) {
    throw new Error("Team ID is required for validation.");
  }

  const supabase = await getSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // --- RATE LIMITING ---
  const isAllowed = await rateLimitService.checkLimit(teamId);
  if (!isAllowed) {
    throw new Error(
      "Limite de requisições excedido. Tente novamente em 1 minuto."
    );
  }

  // Verify if user belongs to the team (Security Check)
  const hasPermission = await verifyTeamPermissionUseCase.execute(
    user.id,
    teamId,
    "MANAGE_EXPENSES"
  );

  if (!hasPermission) {
    throw new Error(
      "Unauthorized: You do not have permission to manage expenses for this team."
    );
  }

  // Let's check feature access first.
  const hasAccess = await checkFeatureAccessUseCase.execute(
    teamId,
    "ai_receipt_scanning"
  );

  if (!hasAccess) {
    throw new Error("Funcionalidade disponivel apenas para equipe PRO.");
  }

  try {
    return await parseReceiptUseCase.execute(file);
  } catch (error) {
    console.error("Erro ao processar recibo:", error);
    return null;
  }
}
