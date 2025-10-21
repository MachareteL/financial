export interface Expense {
  id: string
  amount: number
  description: string
  date: Date
  categoryId: string
  familyId: string
  userId: string
  receiptUrl?: string
  isRecurring: boolean
  recurrenceType?: "monthly" | "weekly" | "yearly"
  isInstallment: boolean
  installmentNumber?: number
  totalInstallments?: number
  parentExpenseId?: string
  createdAt: Date
}

export interface ExpenseWithDetails extends Expense {
  category: Category
  user: {
    name: string
  }
}

export interface Category {
  id: string
  name: string
  classification: "necessidades" | "desejos" | "poupanca"
  familyId: string
  createdAt: Date
}
