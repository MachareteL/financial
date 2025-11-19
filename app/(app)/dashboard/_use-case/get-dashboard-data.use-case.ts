import type { IExpenseRepository } from "@/domain/interfaces/expense.repository.interface";
import type { IBudgetRepository } from "@/domain/interfaces/budget.repository.interface";
import type { IBudgetCategoryRepository } from "@/domain/interfaces/budget-category.repository.interface";
import type {
  DashboardDataDTO,
  DashboardFolderData,
  DashboardExpenseChartData,
  DashboardTransactionDTO,
  DashboardDailyData,
} from "@/domain/dto/dashboard.types.d.ts";

export class GetDashboardDataUseCase {
  constructor(
    private expenseRepository: IExpenseRepository,
    private budgetRepository: IBudgetRepository,
    private budgetCategoryRepository: IBudgetCategoryRepository
  ) {}

  async execute(
    teamId: string,
    month: number,
    year: number
  ): Promise<DashboardDataDTO> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // 1. Buscas em paralelo
    const [budget, budgetCategories, expenses] = await Promise.all([
      this.budgetRepository.findByTeamAndPeriod(teamId, month, year),
      this.budgetCategoryRepository.findByTeamId(teamId),
      this.expenseRepository.findByDateRange(teamId, startDate, endDate),
    ]);

    const totalIncome = budget?.totalIncome ?? 0;
    let totalSpent = 0;

    // Mapas auxiliares
    const folderMap = new Map<string, DashboardFolderData>();
    const expenseChartMap = new Map<string, DashboardExpenseChartData>();

    // Inicializa pastas
    for (const bc of budgetCategories) {
      folderMap.set(bc.id, {
        id: bc.id,
        name: bc.name,
        percentage: bc.percentage,
        budgeted: totalIncome * bc.percentage,
        spent: 0,
        status: "good",
      });
    }

    // --- PROCESSAMENTO DE DADOS ---

    // 1. Gráfico de Evolução Diária
    // Cria um array com todos os dias do mês (1..31)
    const daysInMonth = endDate.getDate();
    const dailyMap = new Array(daysInMonth + 1).fill(0);

    // 2. Processar Despesas
    for (const expense of expenses) {
      totalSpent += expense.amount;

      // Agrupar por Pasta (Folder)
      const budgetCatId = expense.category?.budgetCategoryId;
      if (budgetCatId && folderMap.has(budgetCatId)) {
        folderMap.get(budgetCatId)!.spent += expense.amount;
      }

      // Agrupar por Categoria (Gráfico de Barras)
      const categoryName = expense.category?.name || "Outros";
      const budgetCatName = expense.category?.budgetCategory?.name || "Geral";

      if (!expenseChartMap.has(categoryName)) {
        expenseChartMap.set(categoryName, {
          name: categoryName,
          amount: 0,
          budCategoryName: budgetCatName,
        });
      }
      expenseChartMap.get(categoryName)!.amount += expense.amount;

      // Acumular por Dia
      const day = expense.date.getDate();
      dailyMap[day] += expense.amount;
    }

    // Finaliza dados das Pastas (Status)
    for (const folder of folderMap.values()) {
      if (folder.budgeted > 0) {
        const ratio = folder.spent / folder.budgeted;
        if (ratio > 1) folder.status = "danger";
        else if (ratio > 0.85) folder.status = "warning";
        else folder.status = "good";
      }
    }

    // Finaliza dados Diários (Acumulado)
    let currentAccumulated = 0;
    const dailySpending: DashboardDailyData[] = [];
    const today = new Date();
    const isCurrentMonth =
      today.getMonth() + 1 === month && today.getFullYear() === year;
    const currentDay = isCurrentMonth ? today.getDate() : daysInMonth;

    for (let i = 1; i <= daysInMonth; i++) {
      // Só preenchemos o gráfico até o dia atual se for o mês corrente (pra não cair a linha pra zero no futuro)
      if (isCurrentMonth && i > currentDay) break;

      currentAccumulated += dailyMap[i];
      dailySpending.push({
        day: i,
        spent: currentAccumulated,
        projected: 0, // (Opcional: poderia ser uma linha de meta linear)
      });
    }

    // 3. Últimas Transações (Top 5)
    // As despesas já vêm ordenadas por data DESC do repositório? Se sim, pegamos as 5 primeiras.
    // Se não, deveríamos ordenar. O repo `findByDateRange` ordena `date DESC`.
    const recentTransactions: DashboardTransactionDTO[] = expenses
      .slice(0, 5)
      .map((e) => ({
        id: e.id,
        description: e.description,
        amount: e.amount,
        date: e.date.toISOString().split("T")[0],
        categoryName: e.category?.name || "Sem categoria",
      }));

    return {
      totalIncome,
      totalSpent,
      balance: totalIncome - totalSpent,
      folders: Array.from(folderMap.values()),
      expenseChartData: Array.from(expenseChartMap.values())
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 6),
      recentTransactions,
      dailySpending,
    };
  }
}
