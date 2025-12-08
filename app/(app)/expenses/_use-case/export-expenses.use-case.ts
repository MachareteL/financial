import { IExpenseRepository } from "@/domain/interfaces/expense.repository.interface";
import { ISubscriptionRepository } from "@/domain/interfaces/subscription.repository.interface";
import { IExpenseExporter } from "@/domain/interfaces/expense-exporter.interface";

export class ExportExpensesUseCase {
  constructor(
    private expenseRepository: IExpenseRepository,
    private subscriptionRepository: ISubscriptionRepository,
    private excelExporterService: IExpenseExporter
  ) {}

  async execute(
    teamId: string,
    startDate: Date,
    endDate: Date
  ): Promise<string> {
    // 1. Verify PRO Status
    const subscription = await this.subscriptionRepository.findByTeamId(teamId);
    const isPro =
      subscription &&
      (subscription.status === "active" || subscription.status === "trialing");

    if (!isPro) {
      throw new Error("Funcionalidade exclusiva para planos PRO.");
    }

    // 2. Fetch Expenses
    // Using a large limit to export 'all' in the range.
    // Ideally repository should have a streaming or no-limit method, but for now we set high limit.
    const expenses = await this.expenseRepository.findByDateRange(
      teamId,
      startDate,
      endDate,
      1,
      10000 // Limit 10k rows for export protection
    );

    // 3. Generate Excel
    const buffer = this.excelExporterService.generateExpensesExcel(expenses);

    // 4. Return Base64
    return buffer.toString("base64");
  }
}
