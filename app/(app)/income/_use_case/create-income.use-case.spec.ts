import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { CreateIncomeUseCase } from "./create-income.use-case";
import { IIncomeRepository } from "@/domain/interfaces/income.repository.interface";
import { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import type { CreateIncomeDTO } from "@/domain/dto/income.types.d.ts";

describe("CreateIncomeUseCase", () => {
  let useCase: CreateIncomeUseCase;
  let incomeRepository: IIncomeRepository;
  let teamRepository: ITeamRepository;

  beforeEach(() => {
    incomeRepository = {
      create: vi.fn(),
    } as unknown as IIncomeRepository;

    teamRepository = {
      verifyPermission: vi.fn().mockResolvedValue(true),
    } as unknown as ITeamRepository;

    useCase = new CreateIncomeUseCase(incomeRepository, teamRepository);
  });

  const validDTO: CreateIncomeDTO = {
    userId: "123e4567-e89b-12d3-a456-426614174000",
    teamId: "123e4567-e89b-12d3-a456-426614174001",
    amount: 1000,
    description: "Freelance",
    type: "one_time",
    date: new Date().toISOString(),
  };

  it("should create income successfully", async () => {
    await useCase.execute(validDTO);

    expect(teamRepository.verifyPermission).toHaveBeenCalledWith(
      validDTO.userId,
      validDTO.teamId,
      "MANAGE_BUDGET"
    );
    expect(incomeRepository.create).toHaveBeenCalled();
  });

  it("should throw error if permission denied", async () => {
    (teamRepository.verifyPermission as Mock).mockResolvedValue(false);

    await expect(useCase.execute(validDTO)).rejects.toThrow("Permissão negada");
    expect(incomeRepository.create).not.toHaveBeenCalled();
  });
});
