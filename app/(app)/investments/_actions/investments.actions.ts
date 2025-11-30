"use server";

import {
  getInvestmentsUseCase,
  createInvestmentUseCase,
  updateInvestmentUseCase,
  deleteInvestmentUseCase,
} from "@/infrastructure/dependency-injection";
import type {
  InvestmentDetailsDTO,
  CreateInvestmentDTO,
  UpdateInvestmentDTO,
  DeleteInvestmentDTO,
} from "@/domain/dto/investment.types";

export async function getInvestmentsAction(
  teamId: string
): Promise<InvestmentDetailsDTO[]> {
  return await getInvestmentsUseCase.execute(teamId);
}

export async function createInvestmentAction(
  data: CreateInvestmentDTO
): Promise<void> {
  await createInvestmentUseCase.execute(data);
}

export async function updateInvestmentAction(
  data: UpdateInvestmentDTO
): Promise<void> {
  await updateInvestmentUseCase.execute(data);
}

export async function deleteInvestmentAction(
  data: DeleteInvestmentDTO
): Promise<void> {
  await deleteInvestmentUseCase.execute(data);
}
