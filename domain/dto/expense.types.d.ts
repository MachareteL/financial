export type ExpenseDetailsDTO = {
  id: string;
  amount: number;
  description: string | null | undefined;
  date: string;
  teamId: string;
  userId: string;
  categoryId: string;
  receiptUrl: string | null | undefined;

  category: {
    id: string;
    name: string;
    classification: "necessidades" | "desejos" | "poupanca";
  } | null;

  owner: {
    name: string;
  } | null;

  isRecurring: boolean;
  recurrenceType: "monthly" | "weekly" | "yearly" | null | undefined;
  isInstallment: boolean;
  installmentNumber: number | null | undefined;
  totalInstallments: number | null | undefined;
};

export type CreateExpenseDTO = {
  amount: number;
  description?: string;
  date: string;
  categoryId: string;
  teamId: string;
  userId: string;
  receiptUrl?: string;
  isRecurring?: boolean;
  recurrenceType?: "monthly" | "weekly" | "yearly";
  isInstallment?: boolean;
  installmentNumber?: number;
  totalInstallments?: number;
  parentExpenseId?: string;
};

export type UpdateExpenseDTO = {
  expenseId: string;
  teamId: string;
  amount: number;
  description?: string;
  date: string;
  categoryId: string;
  receiptUrl?: string;
};

export type DeleteExpenseDTO = {
  expenseId: string;
  teamId: string;
};
