import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateBudgetCategoryUseCase } from "./create-budget-category.use-case";
import { IBudgetCategoryRepository } from "@/domain/interfaces/budget-category.repository.interface";
import { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import type { CreateBudgetCategoryDTO } from "@/domain/dto/budget-category.types.d.ts";

describe("CreateBudgetCategoryUseCase", () => {
  let useCase: CreateBudgetCategoryUseCase;
  let budgetCategoryRepository: IBudgetCategoryRepository;
  let teamRepository: ITeamRepository;

  beforeEach(() => {
    budgetCategoryRepository = {
      create: vi.fn(),
    } as unknown as IBudgetCategoryRepository;

    teamRepository = {
      verifyPermission: vi.fn().mockResolvedValue(true),
    } as unknown as ITeamRepository;

    useCase = new CreateBudgetCategoryUseCase(
      budgetCategoryRepository,
      teamRepository
    );
  });

  const validDTO: CreateBudgetCategoryDTO = {
    userId: "123e4567-e89b-12d3-a456-426614174000",
    teamId: "123e4567-e89b-12d3-a456-426614174001",
    name: "New Category",
    percentage: 0.2,
  };

  it("should create budget category successfully", async () => {
    await useCase.execute(validDTO);

    expect(teamRepository.verifyPermission).toHaveBeenCalledWith(
      validDTO.userId,
      validDTO.teamId,
      "MANAGE_BUDGET"
    );
    expect(budgetCategoryRepository.create).toHaveBeenCalled();
    const createdCategory = (budgetCategoryRepository.create as any).mock
      .calls[0][0];
    expect(createdCategory.name).toBe("New Category");
    expect(createdCategory.percentage).toBe(0.2);
  });

  it("should throw error if permission denied", async () => {
    (teamRepository.verifyPermission as any).mockResolvedValue(false);

    await expect(useCase.execute(validDTO)).rejects.toThrow(
      "Permissão negada: Você não pode criar categorias de orçamento."
    );
    expect(budgetCategoryRepository.create).not.toHaveBeenCalled();
  });
});
