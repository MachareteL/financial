import type { IIncomeRepository } from "@/domain/interfaces/income.repository.interface";
import type { DeleteIncomeDTO } from "@/domain/dto/income.types.d.ts";

import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";

export class DeleteIncomeUseCase {
  constructor(
    private incomeRepository: IIncomeRepository,
    private teamRepository: ITeamRepository
  ) {}

  async execute(dto: DeleteIncomeDTO): Promise<void> {
    const hasPermission = await this.teamRepository.verifyPermission(
      dto.userId,
      dto.teamId,
      "MANAGE_BUDGET"
    );
    if (!hasPermission) throw new Error("Permissão negada.");

    await this.incomeRepository.delete(dto.incomeId, dto.teamId);
  }
}
