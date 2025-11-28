import type { BudgetProps } from "../entities/budget";

export type BudgetDetailsDTO = Pick<
  BudgetProps,
  "id" | "month" | "year" | "totalIncome"
>;

export type SaveBudgetDTO = {
  teamId: string;
  userId: string;
  month: number;
  year: number;
  totalIncome: number;
};

export type ExpenseSummaryByBudgetCategoryDTO = {
  id: string; // ID da BudgetCategory
  name: string; // Nome (ex: "Necessidades")
  percentage: number; // Percentual (ex: 0.5)
  spent: number; // Gasto total (ex: 1500.00)
  budgeted: number; // Valor planejado (ex: 2500.00)
};
