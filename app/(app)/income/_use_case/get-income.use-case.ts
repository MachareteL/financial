import type { IIncomeRepository } from "@/domain/interfaces/income.repository.interface";
import type { IncomeDetailsDTO } from "@/domain/dto/income.types.d.ts";

export class GetIncomesUseCase {
  constructor(private incomeRepository: IIncomeRepository) {}

  async execute(teamId: string): Promise<IncomeDetailsDTO[]> {
    if (!teamId) {
      throw new Error("Team ID é obrigatório");
    }

    const incomes = await this.incomeRepository.findByTeamId(teamId);

    return incomes.map((income) => ({
      id: income.id,
      amount: income.amount,
      description: income.description,
      type: income.type,
      frequency: income.frequency,
      date: income.date.toISOString().split("T")[0], // Converte Date para string
      userId: income.userId,
    }));
  }
}
