import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { CheckFeatureAccessUseCase } from "./check-feature-access.use-case";
import { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import { ISubscriptionRepository } from "@/domain/interfaces/subscription.repository.interface";
import { Team } from "@/domain/entities/team";
import { Subscription } from "@/domain/entities/subscription";
import { AnalyticsService } from "@/domain/interfaces/analytics-service.interface";

describe("CheckFeatureAccessUseCase", () => {
  let useCase: CheckFeatureAccessUseCase;
  let teamRepository: ITeamRepository;
  let subscriptionRepository: ISubscriptionRepository;
  let analyticsService: AnalyticsService;

  beforeEach(() => {
    teamRepository = {
      getTeamById: vi.fn(),
    } as unknown as ITeamRepository;

    subscriptionRepository = {
      findByTeamId: vi.fn(),
    } as unknown as ISubscriptionRepository;

    analyticsService = {
      track: vi.fn(),
    } as unknown as AnalyticsService;

    useCase = new CheckFeatureAccessUseCase(
      teamRepository,
      subscriptionRepository,
      analyticsService
    );
  });

  it("should return true for any feature if team is PRO", async () => {
    const proTeam = new Team({
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "Pro Team",
      createdBy: "123e4567-e89b-12d3-a456-426614174001",
      createdAt: new Date(),
    });
    // Mock isPro to return true (logic inside entity, but here we mock repo return)
    // Actually isPro depends on subscription status passed to it.

    const activeSubscription = new Subscription({
      id: "123e4567-e89b-12d3-a456-426614174002",
      teamId: "123e4567-e89b-12d3-a456-426614174000",
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

    (teamRepository.getTeamById as Mock).mockResolvedValue(proTeam);
    (subscriptionRepository.findByTeamId as Mock).mockResolvedValue(
      activeSubscription
    );

    const result = await useCase.execute(
      "123e4567-e89b-12d3-a456-426614174000",
      "ai_receipt_scanning"
    );
    expect(result).toBe(true);
  });

  it("should block restricted feature for FREE team", async () => {
    const freeTeam = new Team({
      id: "123e4567-e89b-12d3-a456-426614174003",
      name: "Free Team",
      createdBy: "123e4567-e89b-12d3-a456-426614174001",
      createdAt: new Date(),
    });

    (teamRepository.getTeamById as Mock).mockResolvedValue(freeTeam);
    (subscriptionRepository.findByTeamId as Mock).mockResolvedValue(null); // No sub

    const result = await useCase.execute(
      "123e4567-e89b-12d3-a456-426614174003",
      "ai_receipt_scanning"
    );
    expect(result).toBe(false);
  });

  it("should allow non-restricted feature for FREE team", async () => {
    const freeTeam = new Team({
      id: "123e4567-e89b-12d3-a456-426614174003",
      name: "Free Team",
      createdBy: "123e4567-e89b-12d3-a456-426614174001",
      createdAt: new Date(),
    });

    (teamRepository.getTeamById as Mock).mockResolvedValue(freeTeam);
    (subscriptionRepository.findByTeamId as Mock).mockResolvedValue(null);

    const result = await useCase.execute(
      "123e4567-e89b-12d3-a456-426614174003",
      "manual_expense"
    );
    expect(result).toBe(true);
  });

  it("should throw error if team not found", async () => {
    (teamRepository.getTeamById as Mock).mockResolvedValue(null);

    await expect(
      useCase.execute("123e4567-e89b-12d3-a456-426614174000", "any")
    ).rejects.toThrow("Time não encontrado");
  });
});
