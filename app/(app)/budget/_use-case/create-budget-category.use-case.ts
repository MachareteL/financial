import type { IBudgetCategoryRepository } from "@/domain/interfaces/budget-category.repository.interface";
import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import type { CreateBudgetCategoryDTO } from "@/domain/dto/budget-category.types.d.ts";
import { BudgetCategory } from "@/domain/entities/budget-category";

export class CreateBudgetCategoryUseCase {
  constructor(
    private budgetCategoryRepository: IBudgetCategoryRepository,
    private teamRepository: ITeamRepository
  ) {}

  async execute(dto: CreateBudgetCategoryDTO): Promise<void> {
    const hasPermission = await this.teamRepository.verifyPermission(
      dto.userId,
      dto.teamId,
      "MANAGE_BUDGET"
    );

    if (!hasPermission) {
      throw new Error(
        "Permissão negada: Você não pode criar categorias de orçamento."
      );
    }
    const category = new BudgetCategory({
      id: crypto.randomUUID(),
      createdAt: new Date(),
      name: dto.name,
      percentage: dto.percentage,
      teamId: dto.teamId,
    });
    await this.budgetCategoryRepository.create(category);
  }
}
