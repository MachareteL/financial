import type { IExpenseRepository } from "@/domain/interfaces/expense.repository.interface";
import type { ExpenseDetailsDTO } from "@/domain/dto/expense.types.d.ts";
import type { Expense } from "@/domain/entities/expense";

export interface GetExpensesDTO {
  teamId: string;
  startDate?: Date;
  endDate?: Date;
}

export class GetExpensesUseCase {
  constructor(private expenseRepository: IExpenseRepository) {}

  async execute(dto: GetExpensesDTO): Promise<ExpenseDetailsDTO[]> {
    let expenses: Expense[] = [];

    if (dto.startDate && dto.endDate) {
      expenses = await this.expenseRepository.findByDateRange(
        dto.teamId,
        dto.startDate,
        dto.endDate
      );
    } else {
      expenses = await this.expenseRepository.findByTeamId(dto.teamId);
    }

    return expenses.map(this.mapEntityToDTO);
  }

  private mapEntityToDTO(expense: Expense): ExpenseDetailsDTO {
    return {
      id: expense.id,
      amount: expense.amount,
      description: expense.description,
      date: expense.date.toISOString().split("T")[0], // Converte Date para string
      teamId: expense.teamId,
      userId: expense.userId,
      categoryId: expense.categoryId,
      receiptUrl: expense.receiptUrl,

      category: expense.category
        ? {
            id: expense.category.id,
            name: expense.category.name,
            classification: expense.category.classification,
          }
        : null,

      owner: expense.owner
        ? {
            name: expense.owner.name,
          }
        : null,

      isRecurring: expense.isRecurring,
      recurrenceType: expense.recurrenceType,
      isInstallment: expense.isInstallment,
      installmentNumber: expense.installmentNumber,
      totalInstallments: expense.totalInstallments,
    };
  }
}
