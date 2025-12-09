import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import type { ICategoryRepository } from "@/domain/interfaces/category.repository.interface";
import type { IBudgetCategoryRepository } from "@/domain/interfaces/budget-category.repository.interface";
import type { CreateTeamDTO } from "@/domain/dto/team.types.d.ts";
import type { Team } from "@/domain/entities/team";

import type { ISubscriptionRepository } from "@/domain/interfaces/subscription.repository.interface";

export class CreateTeamUseCase {
  constructor(
    private teamRepository: ITeamRepository,
    private categoryRepository: ICategoryRepository,
    private budgetCategoryRepository: IBudgetCategoryRepository,
    private subscriptionRepository: ISubscriptionRepository
  ) {}

  async execute(dto: CreateTeamDTO): Promise<Team> {
    // 1. Anti-Abuse: Check if user already owns a Free team
    const ownedTeams = await this.teamRepository.getTeamsByOwner(dto.userId);

    if (ownedTeams.length > 0) {
      // Check if any of the owned teams is FREE (no active subscription)
      // We need to check the subscription status for each team.
      // Optimization: We could fetch all subscriptions for the user's teams in one go if the repo supported it,
      // but for now, loop is acceptable as N is small (limit is usually 1 or 2).

      let hasFreeTeam = false;

      for (const team of ownedTeams) {
        const subscription = await this.subscriptionRepository.findByTeamId(
          team.id
        );
        // If no subscription or not active, it's a free team.
        // Assuming "isActive()" checks for valid status (active, trialing).
        // If subscription is null, it's definitely free (or trial expired).
        if (!subscription || !subscription.isActive()) {
          hasFreeTeam = true;
          break;
        }
      }

      if (hasFreeTeam) {
        throw new Error(
          "Você já tem um time gratuito. Para criar mais, que tal fazer um upgrade?"
        );
      }
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
