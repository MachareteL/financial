import type { IExpenseRepository } from "@/domain/interfaces/expense.repository.interface";
import type { IBudgetCategoryRepository } from "@/domain/interfaces/budget-category.repository.interface";
import type {
  ExpenseSummaryByBudgetCategoryDTO,
  GetExpenseSummaryDTO,
} from "@/domain/dto/budget.types.d.ts";

export class GetExpenseSummaryByPeriodUseCase {
  constructor(
    private expenseRepository: IExpenseRepository,
    private budgetCategoryRepository: IBudgetCategoryRepository
  ) {}

  async execute(
    dto: GetExpenseSummaryDTO
  ): Promise<ExpenseSummaryByBudgetCategoryDTO[]> {
    const startDate = new Date(dto.year, dto.month - 1, 1);
    const endDate = new Date(dto.year, dto.month, 0, 23, 59, 59, 999);

    const budgetCategories = await this.budgetCategoryRepository.findByTeamId(
      dto.teamId
    );

    const expenses = await this.expenseRepository.findByDateRange(
      dto.teamId,
      startDate,
      endDate
    );

    const expensesByBudgetCategory = new Map<string, number>();
    for (const expense of expenses) {
      const budgetCatId = expense.category?.budgetCategoryId;
      if (budgetCatId) {
        const currentSpent = expensesByBudgetCategory.get(budgetCatId) || 0;
        expensesByBudgetCategory.set(
          budgetCatId,
          currentSpent + expense.amount
        );
      }
    }

    const summary: ExpenseSummaryByBudgetCategoryDTO[] = budgetCategories.map(
      (bc) => {
        const spent = expensesByBudgetCategory.get(bc.id) || 0;
        const budgeted = dto.totalIncome * bc.percentage;

        return {
          id: bc.id,
          name: bc.name,
          percentage: bc.percentage,
          spent: spent,
          budgeted: budgeted,
        };
      }
    );

    return summary;
  }
}
