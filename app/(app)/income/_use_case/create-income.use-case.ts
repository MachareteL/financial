import type { IIncomeRepository } from "@/domain/interfaces/income.repository.interface";
import type { CreateIncomeDTO } from "@/domain/dto/income.types.d.ts";
import { Income } from "@/domain/entities/income";
import { IncomeMapper } from "@/domain/mappers/income.mapper";

import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";

export class CreateIncomeUseCase {
  constructor(
    private incomeRepository: IIncomeRepository,
    private teamRepository: ITeamRepository
  ) {}

  async execute(dto: CreateIncomeDTO): Promise<void> {
    const hasPermission = await this.teamRepository.verifyPermission(
      dto.userId,
      dto.teamId,
      "MANAGE_BUDGET"
    );
    if (!hasPermission) throw new Error("Permissão negada.");

    const income = IncomeMapper.fromCreateDTO(dto);

    await this.incomeRepository.create(income);
  }
}
