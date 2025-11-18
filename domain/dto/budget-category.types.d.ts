import type { BudgetCategoryProps } from "../entities/budget-category";

export type BudgetCategoryDetailsDTO = Pick<
  BudgetCategoryProps,
  "id" | "name" | "percentage"
>;

export type CreateBudgetCategoryDTO = {
  teamId: string;
  name: string;
  percentage: number;
};

export type UpdateBudgetCategoryDTO = {
  teamId: string;
  budgetCategoryId: string;
  name?: string;
  percentage?: number;
};
