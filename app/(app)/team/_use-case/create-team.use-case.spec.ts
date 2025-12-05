import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { CreateTeamUseCase } from "./create-team.use-case";
import { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import { ICategoryRepository } from "@/domain/interfaces/category.repository.interface";
import { IBudgetCategoryRepository } from "@/domain/interfaces/budget-category.repository.interface";
import { ISubscriptionRepository } from "@/domain/interfaces/subscription.repository.interface";
import type { CreateTeamDTO } from "@/domain/dto/team.types.d.ts";
import { Team } from "@/domain/entities/team";
import { Subscription } from "@/domain/entities/subscription";

describe("CreateTeamUseCase", () => {
  let useCase: CreateTeamUseCase;
  let teamRepository: ITeamRepository;
  let categoryRepository: ICategoryRepository;
  let budgetCategoryRepository: IBudgetCategoryRepository;
  let subscriptionRepository: ISubscriptionRepository;

  beforeEach(() => {
    teamRepository = {
      getTeamsByOwner: vi.fn().mockResolvedValue([]),
      createTeam: vi.fn().mockImplementation((name, createdBy, trialEndsAt) => {
        return new Team({
          id: "123e4567-e89b-12d3-a456-426614174000", // valid uuid
          name,
          createdBy,
          trialEndsAt,
          createdAt: new Date(),
        });
      }),
    } as unknown as ITeamRepository;

    categoryRepository = {
      createDefaultCategories: vi.fn(),
    } as unknown as ICategoryRepository;

    budgetCategoryRepository = {
      createDefaultCategories: vi.fn().mockResolvedValue([]),
    } as unknown as IBudgetCategoryRepository;

    subscriptionRepository = {
      findByTeamId: vi.fn().mockResolvedValue(null),
    } as unknown as ISubscriptionRepository;

    useCase = new CreateTeamUseCase(
      teamRepository,
      categoryRepository,
      budgetCategoryRepository,
      subscriptionRepository
    );
  });

  const validDTO: CreateTeamDTO = {
    userId: "123e4567-e89b-12d3-a456-426614174001", // valid uuid
    teamName: "My Team",
  };

  it("should create a team with 14-day trial successfully", async () => {
    const result = await useCase.execute(validDTO);

    expect(teamRepository.createTeam).toHaveBeenCalled();
    expect(result.name).toBe("My Team");

    // Check trial date
    const now = new Date();
    const expectedTrialEnd = new Date(now.setDate(now.getDate() + 14));
    // Allow small difference in ms
    expect(result.trialEndsAt?.getDate()).toBe(expectedTrialEnd.getDate());

    expect(
      budgetCategoryRepository.createDefaultCategories
    ).toHaveBeenCalledWith("123e4567-e89b-12d3-a456-426614174000");
    expect(categoryRepository.createDefaultCategories).toHaveBeenCalledWith(
      "123e4567-e89b-12d3-a456-426614174000",
      []
    );
  });

  it("should throw error if user already owns a FREE team", async () => {
    const freeTeam = new Team({
      id: "123e4567-e89b-12d3-a456-426614174002",
      name: "Free Team",
      createdBy: "123e4567-e89b-12d3-a456-426614174001",
      createdAt: new Date(),
    });

    (teamRepository.getTeamsByOwner as Mock).mockResolvedValue([freeTeam]);
    (subscriptionRepository.findByTeamId as Mock).mockResolvedValue(null); // No sub = FREE

    await expect(useCase.execute(validDTO)).rejects.toThrow(
      "Você já possui um time gratuito. Para criar mais times, faça upgrade dos existentes para o plano PRO."
    );
  });

  it("should allow creation if existing team is PRO (active subscription)", async () => {
    const proTeam = new Team({
      id: "123e4567-e89b-12d3-a456-426614174003",
      name: "Pro Team",
      createdBy: "123e4567-e89b-12d3-a456-426614174001",
      createdAt: new Date(),
    });

    const activeSubscription = new Subscription({
      id: "123e4567-e89b-12d3-a456-426614174004",
      teamId: "123e4567-e89b-12d3-a456-426614174003",
      externalId: "ext-1",
      externalCustomerId: "cus-1",
      gatewayId: "stripe",
      status: "active",
      planId: "pro-plan",
      cancelAtPeriodEnd: false,
      currentPeriodEnd: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    (teamRepository.getTeamsByOwner as Mock).mockResolvedValue([proTeam]);
    (subscriptionRepository.findByTeamId as Mock).mockResolvedValue(
      activeSubscription
    );

    const result = await useCase.execute(validDTO);
    expect(result).toBeInstanceOf(Team);
  });
});
