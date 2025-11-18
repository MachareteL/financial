import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import type { ICategoryRepository } from "@/domain/interfaces/category.repository.interface";
import type { IBudgetCategoryRepository } from "@/domain/interfaces/budget-category.repository.interface";
import type { CreateTeamDTO } from "@/domain/dto/team.types.d.ts";
import type { Team } from "@/domain/entities/team";

export class CreateTeamUseCase {
  constructor(
    private teamRepository: ITeamRepository,
    private categoryRepository: ICategoryRepository,
    private budgetCategoryRepository: IBudgetCategoryRepository
  ) {}

  async execute(dto: CreateTeamDTO): Promise<Team> {
    const team = await this.teamRepository.createTeam(dto.teamName, dto.userId);

    const newBudgetCategories =
      await this.budgetCategoryRepository.createDefaultCategories(team.id);

    await this.categoryRepository.createDefaultCategories(
      team.id,
      newBudgetCategories
    );

    return team;
  }
}
