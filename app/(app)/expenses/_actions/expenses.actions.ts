"use server";

import {
  getExpensesUseCase,
  createExpenseUseCase,
  updateExpenseUseCase,
  deleteExpenseUseCase,
  getExpenseByIdUseCase,
  getExpensesSummaryUseCase,
} from "@/infrastructure/dependency-injection";
import type {
  ExpenseDetailsDTO,
  CreateExpenseDTO,
  UpdateExpenseDTO,
  GetExpensesFilters,
} from "@/domain/dto/expense.types";

export async function getExpensesAction(
  filters: GetExpensesFilters
): Promise<ExpenseDetailsDTO[]> {
  return await getExpensesUseCase.execute(filters);
}

export async function getExpensesSummaryAction(filters: {
  teamId: string;
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
}): Promise<{ total: number; count: number }> {
  return await getExpensesSummaryUseCase.execute(filters);
}

export async function createExpenseAction(
  data: CreateExpenseDTO
): Promise<void> {
  await createExpenseUseCase.execute(data);
}

export async function updateExpenseAction(
  data: UpdateExpenseDTO
): Promise<void> {
  await updateExpenseUseCase.execute(data);
}

export async function deleteExpenseAction(data: {
  expenseId: string;
  teamId: string;
  userId: string;
}): Promise<void> {
  await deleteExpenseUseCase.execute(data);
}

export async function getExpenseByIdAction(data: {
  expenseId: string;
  teamId: string;
}): Promise<ExpenseDetailsDTO | null> {
  return await getExpenseByIdUseCase.execute(data);
}
