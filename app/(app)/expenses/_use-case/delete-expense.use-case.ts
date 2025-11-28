import type { IExpenseRepository } from "@/domain/interfaces/expense.repository.interface";
import type { DeleteExpenseDTO } from "@/domain/dto/expense.types.d.ts";

import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";

export class DeleteExpenseUseCase {
  constructor(
    private expenseRepository: IExpenseRepository,
    private teamRepository: ITeamRepository
  ) {}

  async execute(dto: DeleteExpenseDTO): Promise<void> {
    const hasPermission = await this.teamRepository.verifyPermission(
      dto.userId,
      dto.teamId,
      "MANAGE_EXPENSES"
    );

    if (!hasPermission) {
      throw new Error("Permissão negada: Você não pode excluir despesas.");
    }
    await this.expenseRepository.delete(dto.expenseId, dto.teamId);
  }
}
