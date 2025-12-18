import type { IBudgetRepository } from "@/domain/interfaces/budget.repository.interface";
import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import type { SaveBudgetDTO } from "@/domain/dto/budget.types.d.ts";
import { BudgetMapper } from "@/domain/mappers/budget.mapper";

export class SaveBudgetUseCase {
  constructor(
    private budgetRepository: IBudgetRepository,
    private teamRepository: ITeamRepository
  ) {}

  async execute(dto: SaveBudgetDTO): Promise<void> {
    const hasPermission = await this.teamRepository.verifyPermission(
      dto.userId,
      dto.teamId,
      "MANAGE_BUDGET"
    );

    if (!hasPermission) {
      throw new Error("Permissão negada: Você não pode editar o orçamento.");
    }
    const existingBudget = await this.budgetRepository.findByTeamAndPeriod(
      dto.teamId,
      dto.month,
      dto.year
    );

    if (existingBudget) {
      const updatedBudget = existingBudget.update({
        totalIncome: dto.totalIncome,
      });
      await this.budgetRepository.update(updatedBudget);
    } else {
      const budget = BudgetMapper.fromCreateDTO(dto);
      await this.budgetRepository.create(budget);
    }
  }
}
