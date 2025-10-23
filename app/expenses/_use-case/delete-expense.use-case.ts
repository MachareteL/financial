import type { IExpenseRepository } from "@/domain/interfaces/expense.repository.interface"

export interface DeleteExpenseDTO {
  expenseId: string
  familyId: string
}

export class DeleteExpenseUseCase {
  constructor(private expenseRepository: IExpenseRepository) {}

  async execute(dto: DeleteExpenseDTO): Promise<void> {
    await this.expenseRepository.deleteExpense(dto.expenseId, dto.familyId)
  }
}
