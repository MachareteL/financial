export type DashboardFolderData = {
  id: string;
  name: string;
  percentage: number;
  budgeted: number;
  spent: number;
  status: "good" | "warning" | "danger";
};

export type DashboardExpenseChartData = {
  name: string;
  amount: number;
  budCategoryName: string;
};

export type DashboardTransactionDTO = {
  id: string;
  description: string | null | undefined;
  amount: number;
  date: string;
  categoryName: string;
};

export type DashboardDailyData = {
  day: number;
  spent: number;
  projected: number;
};

export type DashboardDataDTO = {
  totalIncome: number;
  totalSpent: number;
  balance: number;
  folders: DashboardFolderData[];
  expenseChartData: DashboardExpenseChartData[];
  recentTransactions: DashboardTransactionDTO[];
  dailySpending: DashboardDailyData[];
};
