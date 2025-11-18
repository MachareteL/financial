export type DashboardFolderData = {
  id: string;
  name: string;
  percentage: number;
  budgeted: number;
  spent: number;
};

export type DashboardExpenseChartData = {
  name: string;
  amount: number;
  budCategoryName: string;
};

export type DashboardDataDTO = {
  totalIncome: number;
  totalSpent: number;
  folders: DashboardFolderData[];
  expenseChartData: DashboardExpenseChartData[];
};
