import type { IIncomeRepository } from "@/domain/interfaces/income.repository.interface";
import type { IncomeDetailsDTO } from "@/domain/dto/income.types.d.ts";
import { IncomeMapper } from "@/domain/mappers/income.mapper";

export class GetIncomesUseCase {
  constructor(private incomeRepository: IIncomeRepository) {}

  async execute(teamId: string): Promise<IncomeDetailsDTO[]> {
    if (!teamId) {
      throw new Error("Team ID é obrigatório");
    }

    const incomes = await this.incomeRepository.findByTeamId(teamId);

    return incomes.map(IncomeMapper.toDTO);
  }
}
