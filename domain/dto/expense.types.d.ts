export type ExpenseDetailsDTO = {
  id: string;
  amount: number;
  description: string | null | undefined;
  date: string; // string para UI
  teamId: string;
  userId: string;
  categoryId: string;
  receiptUrl: string | null | undefined;

  category: {
    id: string;
    name: string;
    budgetCategoryName: string | null;
  } | null;

  owner: {
    name: string;
  } | null;

  isRecurring: boolean;
  recurrenceType: "monthly" | "weekly" | "yearly" | null | undefined;
  isInstallment: boolean;
  installmentNumber: number | null | undefined;
  installmentValue: number | null | undefined;
  totalInstallments: number | null | undefined;
};

export type CreateExpenseDTO = {
  amount: number;
  description?: string;
  date: string;
  categoryId: string;
  teamId: string;
  userId: string;
  receiptFile?: File | null;
  isRecurring?: boolean;
  recurrenceType?: "monthly" | "weekly" | "yearly";
  isInstallment?: boolean;
  installmentValue?: number;
  totalInstallments?: number;
};

export type UpdateExpenseDTO = {
  expenseId: string;
  teamId: string;
  userId: string;
  amount?: number;
  description?: string;
  date?: string;
  categoryId?: string;
  receiptUrl?: string | null; // URL existente ou null para remover
  receiptFile?: File | null;
  installmentValue?: number;
};

export type DeleteExpenseDTO = {
  expenseId: string;
  teamId: string;
  userId: string;
};

export type GetExpensesFilters = {
  teamId: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
};
