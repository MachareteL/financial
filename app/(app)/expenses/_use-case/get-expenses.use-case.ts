import type { IExpenseRepository } from "@/domain/interfaces/expense.repository.interface";
import type {
  ExpenseDetailsDTO,
  GetExpensesDTO,
} from "@/domain/dto/expense.types.d.ts";
import type { Expense } from "@/domain/entities/expense";
import { ExpenseMapper } from "@/domain/mappers/expense.mapper";

export class GetExpensesUseCase {
  constructor(private expenseRepository: IExpenseRepository) {}

  async execute(dto: GetExpensesDTO): Promise<ExpenseDetailsDTO[]> {
    let expenses: Expense[] = [];
    const page = dto.page || 1;
    const limit = dto.limit || 20;

    if (dto.startDate && dto.endDate) {
      expenses = await this.expenseRepository.findByDateRange(
        dto.teamId,
        dto.startDate,
        dto.endDate,
        page,
        limit
      );
    } else {
      expenses = await this.expenseRepository.findByTeamId(
        dto.teamId,
        page,
        limit
      );
    }

    return expenses.map(ExpenseMapper.toDTO);
  }
}
