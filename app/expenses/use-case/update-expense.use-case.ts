import type { IExpenseRepository } from "@/domain/repositories/expense.repository.interface"
import type { Expense } from "@/domain/entities/expense.entity"

export interface UpdateExpenseDTO {
  expenseId: string
  familyId: string
  amount?: number
  description?: string
  date?: Date
  categoryId?: string
  receiptUrl?: string
}

export class UpdateExpenseUseCase {
  constructor(private expenseRepository: IExpenseRepository) {}

  async execute(dto: UpdateExpenseDTO): Promise<Expense> {
    return await this.expenseRepository.updateExpense(dto.expenseId, dto.familyId, {
      amount: dto.amount,
      description: dto.description,
      date: dto.date,
      categoryId: dto.categoryId,
      receiptUrl: dto.receiptUrl,
    })
  }
}
