import { Expense } from "../entities/expense";

export interface IExpenseExporter {
  generateExpensesExcel(expenses: Expense[]): Buffer;
}
