import { describe, it, expect, vi, beforeEach } from "vitest";
import { SaveBudgetUseCase } from "./save-budget.use-case";
import { IBudgetRepository } from "@/domain/interfaces/budget.repository.interface";
import { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import type { SaveBudgetDTO } from "@/domain/dto/budget.types.d.ts";
import { Budget } from "@/domain/entities/budget";

describe("SaveBudgetUseCase", () => {
  let useCase: SaveBudgetUseCase;
  let budgetRepository: IBudgetRepository;
  let teamRepository: ITeamRepository;

  beforeEach(() => {
    budgetRepository = {
      findByTeamAndPeriod: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      update: vi.fn(),
    } as unknown as IBudgetRepository;

    teamRepository = {
      verifyPermission: vi.fn().mockResolvedValue(true),
    } as unknown as ITeamRepository;

    useCase = new SaveBudgetUseCase(budgetRepository, teamRepository);
  });

  const validDTO: SaveBudgetDTO = {
    userId: "123e4567-e89b-12d3-a456-426614174001",
    teamId: "123e4567-e89b-12d3-a456-426614174000",
    month: 10,
    year: 2023,
    totalIncome: 5000,
  };

  it("should create a new budget if it does not exist", async () => {
    await useCase.execute(validDTO);

    expect(teamRepository.verifyPermission).toHaveBeenCalledWith(
      "123e4567-e89b-12d3-a456-426614174001",
      "123e4567-e89b-12d3-a456-426614174000",
      "MANAGE_BUDGET"
    );
    expect(budgetRepository.findByTeamAndPeriod).toHaveBeenCalledWith(
      "123e4567-e89b-12d3-a456-426614174000",
      10,
      2023
    );
    expect(budgetRepository.create).toHaveBeenCalled();
    expect(budgetRepository.update).not.toHaveBeenCalled();
  });

  it("should update existing budget if it exists", async () => {
    const existingBudget = new Budget({
      id: "123e4567-e89b-12d3-a456-426614174002",
      teamId: "123e4567-e89b-12d3-a456-426614174000",
      month: 10,
      year: 2023,
      totalIncome: 4000,
      createdAt: new Date(),
    });

    (budgetRepository.findByTeamAndPeriod as any).mockResolvedValue(
      existingBudget
    );

    await useCase.execute(validDTO);

    expect(budgetRepository.update).toHaveBeenCalled();
    const updatedBudget = (budgetRepository.update as any).mock.calls[0][0];
    expect(updatedBudget.totalIncome).toBe(5000);
    expect(budgetRepository.create).not.toHaveBeenCalled();
  });

  it("should throw error if permission denied", async () => {
    (teamRepository.verifyPermission as any).mockResolvedValue(false);

    await expect(useCase.execute(validDTO)).rejects.toThrow(
      "Permissão negada: Você não pode editar o orçamento."
    );
    expect(budgetRepository.create).not.toHaveBeenCalled();
    expect(budgetRepository.update).not.toHaveBeenCalled();
  });
});
