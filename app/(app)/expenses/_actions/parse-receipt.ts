"use server";

import {
  getParseReceiptUseCase,
  getCheckFeatureAccessUseCase,
  getVerifyTeamPermissionUseCase,
  getRateLimitService,
  getCategoryRepository,
} from "@/infrastructure/dependency-injection/server-container";
import { getSupabaseClient } from "@/infrastructure/database/supabase.server";
import type { ReceiptDataDTO } from "@/domain/dto/receipt.dto";

export type ParseReceiptResult =
  | { success: true; data: ReceiptDataDTO }
  | { success: false; error: string; code: string };

export async function parseReceiptAction(
  formData: FormData
): Promise<ParseReceiptResult> {
  const file = formData.get("file") as File;
  const teamId = formData.get("teamId") as string;

  if (!file || file.size === 0) {
    return {
      success: false,
      error: "Arquivo inválido ou vazio.",
      code: "INVALID_FILE",
    };
  }

  // --- GATEKEEPER VALIDATION ---
  if (!teamId) {
    return {
      success: false,
      error: "Team ID is required.",
      code: "MISSING_TEAM_ID",
    };
  }

  const supabase = await getSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };
  }

  // --- RATE LIMITING ---
  const rateLimitService = getRateLimitService();
  const isAllowed = await rateLimitService.checkLimit(teamId);
  if (!isAllowed) {
    return {
      success: false,
      error: "Limite de requisições excedido. Tente novamente em 1 minuto.",
      code: "RATE_LIMIT_EXCEEDED",
    };
  }

  // Verify if user belongs to the team (Security Check)
  const verifyTeamPermissionUseCase = await getVerifyTeamPermissionUseCase();
  const hasPermission = await verifyTeamPermissionUseCase.execute(
    user.id,
    teamId,
    "MANAGE_EXPENSES"
  );

  if (!hasPermission) {
    return {
      success: false,
      error: "Você não tem permissão para gerenciar despesas nesta equipe.",
      code: "PERMISSION_DENIED",
    };
  }

  // Let's check feature access first.
  const checkFeatureAccessUseCase = await getCheckFeatureAccessUseCase();
  const hasAccess = await checkFeatureAccessUseCase.execute(
    teamId,
    "ai_receipt_scanning",
    user.id
  );

  if (!hasAccess) {
    return {
      success: false,
      error: "Funcionalidade disponível apenas para equipe PRO.",
      code: "FEATURE_LOCKED",
    };
  }

  try {
    // Fetch team categories to provide context to AI
    const categoryRepository = await getCategoryRepository();
    const teamCategories = await categoryRepository.findByTeamId(teamId);
    const categoryNames = teamCategories.map((cat) => cat.name);

    const parseReceiptUseCase = getParseReceiptUseCase();
    const result = await parseReceiptUseCase.execute(
      file,
      user.id,
      categoryNames
    );

    if (!result) {
      return {
        success: false,
        error: "Não foi possível ler os dados do recibo.",
        code: "PARSE_FAILED",
      };
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("Erro ao processar recibo:", error);
    return {
      success: false,
      error: "Erro interno ao processar recibo.",
      code: "INTERNAL_ERROR",
    };
  }
}
