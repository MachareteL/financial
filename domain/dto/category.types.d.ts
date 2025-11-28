import type { CategoryProps } from "../entities/category";

export type CategoryDetailsDTO = {
  id: string;
  name: string;
  budgetCategoryId: string | null;
  budgetCategoryName: string | null;
};

export type CreateCategoryDTO = {
  name: string;
  budgetCategoryId: string;
  teamId: string;
  userId: string;
};

export type UpdateCategoryDTO = {
  categoryId: string;
  teamId: string;
  userId: string;
  name?: string;
  budgetCategoryId?: string;
};

export type DeleteCategoryDTO = {
  categoryId: string;
  teamId: string;
  userId: string;
};
