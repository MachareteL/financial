import type { IIncomeRepository } from "@/domain/interfaces/income.repository.interface";
import type { UpdateIncomeDTO } from "@/domain/dto/income.types.d.ts";

import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";

export class UpdateIncomeUseCase {
  constructor(
    private incomeRepository: IIncomeRepository,
    private teamRepository: ITeamRepository
  ) {}

  async execute(dto: UpdateIncomeDTO): Promise<void> {
    const hasPermission = await this.teamRepository.verifyPermission(
      dto.userId,
      dto.teamId,
      "MANAGE_BUDGET"
    );
    if (!hasPermission) throw new Error("Permissão negada.");

    const existingIncome = await this.incomeRepository.findById(
      dto.incomeId,
      dto.teamId
    );

    if (!existingIncome) {
      throw new Error("Receita não encontrada ou você não tem permissão");
    }

    const updatedIncome = existingIncome.update({
      amount: dto.amount,
      description: dto.description,
      type: dto.type,
      frequency: dto.frequency,
      date: new Date(dto.date.replace(/-/g, "/")),
    });

    await this.incomeRepository.update(updatedIncome);
  }
}
