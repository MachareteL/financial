import type { IExpenseRepository } from "@/domain/interfaces/expense.repository.interface";
import type {
  ExpenseDetailsDTO,
  GetExpenseByIdDTO,
} from "@/domain/dto/expense.types.d.ts";
import type { Expense } from "@/domain/entities/expense";

export class GetExpenseByIdUseCase {
  constructor(private expenseRepository: IExpenseRepository) {}

  async execute(dto: GetExpenseByIdDTO): Promise<ExpenseDetailsDTO | null> {
    const expense = await this.expenseRepository.findById(
      dto.expenseId,
      dto.teamId
    );

    if (!expense) {
      return null;
    }

    return this.mapEntityToDTO(expense);
  }

  private mapEntityToDTO(expense: Expense): ExpenseDetailsDTO {
    return {
      id: expense.id,
      amount: expense.amount,
      description: expense.description,
      date: expense.date.toISOString().split("T")[0], // YYYY-MM-DD
      teamId: expense.teamId,
      userId: expense.userId,
      categoryId: expense.categoryId,
      receiptUrl: expense.receiptUrl,

      category: expense.category
        ? {
            id: expense.category.id,
            name: expense.category.name,
            budgetCategoryName: expense.category.budgetCategory?.name || null,
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
      installmentValue: expense.installmentValue,
      totalInstallments: expense.totalInstallments,
    };
  }
}
