"use server";

import { getDashboardDataUseCase } from "@/infrastructure/dependency-injection";
import type { DashboardDataDTO } from "@/domain/dto/dashboard.types";

export async function getDashboardDataAction(
  teamId: string,
  month: number,
  year: number
): Promise<DashboardDataDTO> {
  return await getDashboardDataUseCase.execute(teamId, month, year);
}
