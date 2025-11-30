"use server";

import {
  getIncomesUseCase,
  createIncomeUseCase,
  updateIncomeUseCase,
  deleteIncomeUseCase,
  getBudgetUseCase,
  saveBudgetUseCase,
  getBudgetCategoriesUseCase,
  createBudgetCategoryUseCase,
  updateBudgetCategoryUseCase,
  deleteBudgetCategoryUseCase,
} from "@/infrastructure/dependency-injection";
import type {
  IncomeDetailsDTO,
  CreateIncomeDTO,
  UpdateIncomeDTO,
} from "@/domain/dto/income.types";
import type { BudgetCategoryDetailsDTO } from "@/domain/dto/budget-category.types";
import type { BudgetDetailsDTO } from "@/domain/dto/budget.types";

// Incomes
export async function getIncomesAction(
  teamId: string
): Promise<IncomeDetailsDTO[]> {
  return await getIncomesUseCase.execute(teamId);
}

export async function createIncomeAction(data: CreateIncomeDTO): Promise<void> {
  await createIncomeUseCase.execute(data);
}

export async function updateIncomeAction(data: UpdateIncomeDTO): Promise<void> {
  await updateIncomeUseCase.execute(data);
}

export async function deleteIncomeAction(data: {
  incomeId: string;
  teamId: string;
  userId: string;
}): Promise<void> {
  await deleteIncomeUseCase.execute(data);
}

// Budget
export async function getBudgetAction(data: {
  teamId: string;
  month: number;
  year: number;
}): Promise<BudgetDetailsDTO | null> {
  return await getBudgetUseCase.execute(data);
}

export async function saveBudgetAction(data: {
  teamId: string;
  userId: string;
  month: number;
  year: number;
  totalIncome: number;
}): Promise<void> {
  await saveBudgetUseCase.execute(data);
}

// Budget Categories
export async function getBudgetCategoriesAction(
  teamId: string
): Promise<BudgetCategoryDetailsDTO[]> {
  return await getBudgetCategoriesUseCase.execute(teamId);
}

export async function createBudgetCategoryAction(data: {
  teamId: string;
  userId: string;
  name: string;
  percentage: number;
}): Promise<void> {
  await createBudgetCategoryUseCase.execute(data);
}

export async function updateBudgetCategoryAction(data: {
  teamId: string;
  userId: string;
  budgetCategoryId: string;
  name?: string;
  percentage?: number;
}): Promise<void> {
  await updateBudgetCategoryUseCase.execute(data);
}

export async function deleteBudgetCategoryAction(data: {
  budgetCategoryId: string;
  teamId: string;
  userId: string;
}): Promise<void> {
  await deleteBudgetCategoryUseCase.execute(data);
}
