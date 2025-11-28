import type { IExpenseRepository } from "@/domain/interfaces/expense.repository.interface";

export interface GetExpensesSummaryDTO {
  teamId: string;
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
}

export interface ExpensesSummaryDTO {
  total: number;
  count: number;
}

export class GetExpensesSummaryUseCase {
  constructor(private expenseRepository: IExpenseRepository) {}

  async execute(dto: GetExpensesSummaryDTO): Promise<ExpensesSummaryDTO> {
    return this.expenseRepository.getSummary(
      dto.teamId,
      dto.startDate,
      dto.endDate,
      dto.categoryId
    );
  }
}
