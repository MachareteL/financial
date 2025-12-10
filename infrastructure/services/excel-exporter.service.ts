import * as XLSX from "xlsx";
import { Expense } from "@/domain/entities/expense";
import { IExpenseExporter } from "@/domain/interfaces/expense-exporter.interface";

export class ExcelExporterService implements IExpenseExporter {
  generateExpensesExcel(expenses: Expense[]): Buffer {
    // 1. Prepare Data
    const data = expenses.map((expense) => ({
      Data: expense.date.toLocaleDateString("pt-BR"),
      Descrição: expense.description,
      Categoria: expense.category?.name || "Sem categoria",
      Valor: expense.amount,
      // Intentionally removed fields
      // Responsável: expense.owner?.name || "N/A",
      // Comprovante: expense.receiptUrl ? "Sim" : "Não",
      Parcelado: expense.isInstallment
        ? `${expense.installmentNumber}/${expense.totalInstallments}`
        : "Não",
    }));

    // 2. Create Sheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 3. Create Workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Despesas");

    // 4. Generate Buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    return buffer;
  }
}
