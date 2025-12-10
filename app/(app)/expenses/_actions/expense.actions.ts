"use server";

import { getSupabaseClient } from "@/infrastructure/database/supabase.server";
import {
  getExportExpensesUseCase,
  getVerifyTeamPermissionUseCase,
} from "@/infrastructure/dependency-injection/server-container";

export async function exportExpensesAction(
  teamId: string,
  startDateStr: string,
  endDateStr: string
) {
  const supabase = await getSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sessão inválida. Faça login novamente.");
  }

  // 1. Verify Permission
  const verifyPermission = await getVerifyTeamPermissionUseCase();
  const hasPermission = await verifyPermission.execute(
    user.id,
    teamId,
    "MANAGE_EXPENSES" // Assuming this permission exists or usage 'VIEW_EXPENSES'
  );

  if (!hasPermission) {
    throw new Error("Você não tem permissão para exportar as despesas.");
  }

  // 2. Execute Export
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  const exportExpensesUseCase = await getExportExpensesUseCase();
  const base64Data = await exportExpensesUseCase.execute(
    teamId,
    startDate,
    endDate
  );

  return base64Data;
}
