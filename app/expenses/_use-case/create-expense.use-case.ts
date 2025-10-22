import type { IExpenseRepository } from "@/domain/IRepositories/expense.repository.interface"
import type { Expense } from "@/domain/Entities/expense.entity"

export interface CreateExpenseDTO {
  amount: number
  description: string
  date: Date
  categoryId: string
  familyId: string
  userId: string
  receiptUrl?: string
  isRecurring?: boolean
  recurrenceType?: "monthly" | "weekly" | "yearly"
  isInstallment?: boolean
  installmentNumber?: number
  totalInstallments?: number
}

export class CreateExpenseUseCase {
  constructor(private expenseRepository: IExpenseRepository) {}

  async execute(dto: CreateExpenseDTO): Promise<Expense> {
    return await this.expenseRepository.createExpense({
      amount: dto.amount,
      description: dto.description,
      date: dto.date,
      categoryId: dto.categoryId,
      familyId: dto.familyId,
      userId: dto.userId,
      receiptUrl: dto.receiptUrl,
      isRecurring: dto.isRecurring || false,
      recurrenceType: dto.recurrenceType,
      isInstallment: dto.isInstallment || false,
      installmentNumber: dto.installmentNumber,
      totalInstallments: dto.totalInstallments,
    })
  }
}
