import type { IBudgetCategoryRepository } from "@/domain/interfaces/budget-category.repository.interface";
import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import type { DeleteBudgetCategoryDTO } from "@/domain/dto/budget-category.types.d.ts";

export class DeleteBudgetCategoryUseCase {
  constructor(
    private budgetCategoryRepository: IBudgetCategoryRepository,
    private teamRepository: ITeamRepository
  ) {}

  async execute(dto: DeleteBudgetCategoryDTO): Promise<void> {
    const hasPermission = await this.teamRepository.verifyPermission(
      dto.userId,
      dto.teamId,
      "MANAGE_BUDGET"
    );

    if (!hasPermission) {
      throw new Error(
        "Permissão negada: Você não pode excluir categorias de orçamento."
      );
    }
    await this.budgetCategoryRepository.delete(
      dto.budgetCategoryId,
      dto.teamId
    );
  }
}
