import type { IBudgetCategoryRepository } from "@/domain/interfaces/budget-category.repository.interface";
import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import type { UpdateBudgetCategoryDTO } from "@/domain/dto/budget-category.types.d.ts";

export class UpdateBudgetCategoryUseCase {
  constructor(
    private budgetCategoryRepository: IBudgetCategoryRepository,
    private teamRepository: ITeamRepository
  ) {}

  async execute(dto: UpdateBudgetCategoryDTO): Promise<void> {
    const hasPermission = await this.teamRepository.verifyPermission(
      dto.userId,
      dto.teamId,
      "MANAGE_BUDGET"
    );

    if (!hasPermission) {
      throw new Error(
        "Permissão negada: Você não pode editar categorias de orçamento."
      );
    }
    const existing = await this.budgetCategoryRepository.findById(
      dto.budgetCategoryId,
      dto.teamId
    );
    if (!existing) throw new Error("Categoria de orçamento não encontrada");

    const updated = existing.update({
      name: dto.name,
      percentage: dto.percentage,
    });

    await this.budgetCategoryRepository.update(updated);
  }
}
