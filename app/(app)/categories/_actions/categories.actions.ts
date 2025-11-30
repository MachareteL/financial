"use server";

import {
  getCategoriesUseCase,
  createCategoryUseCase,
  updateCategoryUseCase,
  deleteCategoryUseCase,
} from "@/infrastructure/dependency-injection";
import type { CategoryDetailsDTO } from "@/domain/dto/category.types";

export async function getCategoriesAction(
  teamId: string
): Promise<CategoryDetailsDTO[]> {
  return await getCategoriesUseCase.execute(teamId);
}

export async function createCategoryAction(data: {
  name: string;
  budgetCategoryId: string;
  teamId: string;
  userId: string;
}): Promise<void> {
  await createCategoryUseCase.execute(data);
}

export async function updateCategoryAction(data: {
  categoryId: string;
  teamId: string;
  userId: string;
  name?: string;
  budgetCategoryId?: string;
}): Promise<void> {
  await updateCategoryUseCase.execute(data);
}

export async function deleteCategoryAction(data: {
  categoryId: string;
  teamId: string;
  userId: string;
}): Promise<void> {
  await deleteCategoryUseCase.execute(data);
}
