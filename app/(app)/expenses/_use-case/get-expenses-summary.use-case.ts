import type { IExpenseRepository } from "@/domain/interfaces/expense.repository.interface";
import type {
  GetExpensesSummaryDTO,
  ExpensesSummaryDTO,
} from "@/domain/dto/expense.types.d.ts";

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
