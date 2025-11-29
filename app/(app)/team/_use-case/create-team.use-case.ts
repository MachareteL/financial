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
    // 1. Anti-Abuse: Check if user already owns 2 teams
    const ownedTeamsCount = await this.teamRepository.countTeamsByOwner(
      dto.userId
    );
    if (ownedTeamsCount >= 2) {
      throw new Error(
        "Você atingiu o limite de 2 times criados. Entre em contato para aumentar seu limite."
      );
    }

    // 2. Set Trial End Date (14 days from now)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    // 3. Create Team
    const team = await this.teamRepository.createTeam(
      dto.teamName,
      dto.userId,
      trialEndsAt
    );

    const newBudgetCategories =
      await this.budgetCategoryRepository.createDefaultCategories(team.id);

    await this.categoryRepository.createDefaultCategories(
      team.id,
      newBudgetCategories
    );

    return team;
  }
}
