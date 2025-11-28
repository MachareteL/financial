export type IncomeDetailsDTO = {
  id: string;
  amount: number;
  description: string | null | undefined;
  type: "recurring" | "one_time";
  frequency: "monthly" | "weekly" | "yearly" | null | undefined;
  date: string;
  userId: string;
};

export type CreateIncomeDTO = {
  amount: number;
  description?: string;
  type: "recurring" | "one_time";
  frequency?: "monthly" | "weekly" | "yearly";
  date: string; // UI envia string
  teamId: string;
  userId: string;
};

export type UpdateIncomeDTO = {
  incomeId: string;
  teamId: string;
  amount: number;
  description?: string;
  type: "recurring" | "one_time";
  frequency?: "monthly" | "weekly" | "yearly";
  date: string;
};

export type DeleteIncomeDTO = {
  incomeId: string;
  teamId: string;
};
