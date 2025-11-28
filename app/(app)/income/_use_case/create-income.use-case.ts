import type { IIncomeRepository } from "@/domain/interfaces/income.repository.interface";
import type { CreateIncomeDTO } from "@/domain/dto/income.types.d.ts";
import { Income } from "@/domain/entities/income";

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

    const income = new Income({
      id: crypto.randomUUID(),
      amount: dto.amount,
      description: dto.description,
      type: dto.type,
      frequency: dto.frequency,
      date: new Date(dto.date.replace(/-/g, "/")),
      teamId: dto.teamId,
      userId: dto.userId,
      createdAt: new Date(),
    });

    await this.incomeRepository.create(income);
  }
}
