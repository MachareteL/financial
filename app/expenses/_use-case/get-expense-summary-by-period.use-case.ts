import type { IExpenseRepository } from '@/domain/interfaces/expense.repository.interface'
import type { ExpenseSummaryDTO } from '@/domain/dto/budget.types.d.ts'

export interface GetExpenseSummaryDTO {
  teamId: string
  month: number
  year: number
}

export class GetExpenseSummaryByPeriodUseCase {
  constructor(private expenseRepository: IExpenseRepository) {}

  async execute(dto: GetExpenseSummaryDTO): Promise<ExpenseSummaryDTO> {
    const startDate = new Date(dto.year, dto.month - 1, 1)
    const endDate = new Date(dto.year, dto.month, 0, 23, 59, 59, 999)

    const expenses = await this.expenseRepository.findByDateRange(dto.teamId, startDate, endDate)

    const totals: ExpenseSummaryDTO = {
      necessidades: 0,
      desejos: 0,
      poupanca: 0,
      total: 0,
    }

    for (const expense of expenses) {
      const classification = expense.category?.classification || 'necessidades'
      if (classification in totals) {
         totals[classification as keyof typeof totals] += expense.amount
      }
      totals.total += expense.amount
    }

    return totals
  }
}