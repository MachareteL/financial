import type { IExpenseRepository } from "@/domain/IRepositories/expense.repository.interface"
import type { ExpenseWithDetails } from "@/domain/Entities/expense.entity"

export interface GetExpensesDTO {
  familyId: string
  startDate?: Date
  endDate?: Date
}

export class GetExpensesUseCase {
  constructor(private expenseRepository: IExpenseRepository) {}

  async execute(dto: GetExpensesDTO): Promise<ExpenseWithDetails[]> {
    if (dto.startDate && dto.endDate) {
      return await this.expenseRepository.getExpensesByDateRange(dto.familyId, dto.startDate, dto.endDate)
    }

    return await this.expenseRepository.getExpensesByFamily(dto.familyId)
  }
}
