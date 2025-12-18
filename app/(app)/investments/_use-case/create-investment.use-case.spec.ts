import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { CreateInvestmentUseCase } from "./create-investment.use-case";
import { IInvestmentRepository } from "@/domain/interfaces/investment.repository.interface";
import { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import type { CreateInvestmentDTO } from "@/domain/dto/investment.types.d.ts";

describe("CreateInvestmentUseCase", () => {
  let useCase: CreateInvestmentUseCase;
  let investmentRepository: IInvestmentRepository;
  let teamRepository: ITeamRepository;

  beforeEach(() => {
    investmentRepository = {
      create: vi.fn(),
    } as unknown as IInvestmentRepository;

    teamRepository = {
      verifyPermission: vi.fn().mockResolvedValue(true),
    } as unknown as ITeamRepository;

    useCase = new CreateInvestmentUseCase(investmentRepository, teamRepository);
  });

  const validDTO: CreateInvestmentDTO = {
    userId: "123e4567-e89b-12d3-a456-426614174000",
    teamId: "123e4567-e89b-12d3-a456-426614174001",
    name: "Tech Stocks",
    type: "stocks",
    initialAmount: 5000,
    currentAmount: 5500,
    monthlyContribution: 200,
    annualReturnRate: 8.5,
    startDate: new Date().toISOString(),
  };

  it("should create investment successfully", async () => {
    await useCase.execute(validDTO);

    expect(teamRepository.verifyPermission).toHaveBeenCalledWith(
      validDTO.userId,
      validDTO.teamId,
      "MANAGE_INVESTMENTS"
    );
    expect(investmentRepository.create).toHaveBeenCalled();
  });

  it("should throw error if permission denied", async () => {
    (teamRepository.verifyPermission as Mock).mockResolvedValue(false);

    await expect(useCase.execute(validDTO)).rejects.toThrow(
      "Permissão negada: Você não pode criar investimentos."
    );
    expect(investmentRepository.create).not.toHaveBeenCalled();
  });
});
