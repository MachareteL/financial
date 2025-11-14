
export type DashboardExpenseData = {
  category: string
  amount: number
  classification: string
}

export type DashboardMonthlyData = {
  necessidades: number
  desejos: number
  poupanca: number
  total: number
}

export type DashboardDataDTO = {
  expenses: DashboardExpenseData[]
  monthlyData: DashboardMonthlyData
  monthlyIncome: number
}