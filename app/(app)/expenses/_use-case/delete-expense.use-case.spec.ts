import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeleteExpenseUseCase } from "./delete-expense.use-case";
import { IExpenseRepository } from "@/domain/interfaces/expense.repository.interface";
import { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import type { DeleteExpenseDTO } from "@/domain/dto/expense.types.d.ts";

describe("DeleteExpenseUseCase", () => {
  let useCase: DeleteExpenseUseCase;
  let expenseRepository: IExpenseRepository;
  let teamRepository: ITeamRepository;

  beforeEach(() => {
    expenseRepository = {
      delete: vi.fn(),
    } as unknown as IExpenseRepository;

    teamRepository = {
      verifyPermission: vi.fn().mockResolvedValue(true),
    } as unknown as ITeamRepository;

    useCase = new DeleteExpenseUseCase(expenseRepository, teamRepository);
  });

  const validDTO: DeleteExpenseDTO = {
    expenseId: "123e4567-e89b-12d3-a456-426614174000",
    teamId: "123e4567-e89b-12d3-a456-426614174001",
    userId: "123e4567-e89b-12d3-a456-426614174002",
  };

  it("should delete expense successfully", async () => {
    await useCase.execute(validDTO);

    expect(teamRepository.verifyPermission).toHaveBeenCalledWith(
      validDTO.userId,
      validDTO.teamId,
      "MANAGE_EXPENSES"
    );
    expect(expenseRepository.delete).toHaveBeenCalledWith(
      validDTO.expenseId,
      validDTO.teamId
    );
  });

  it("should throw error if permission denied", async () => {
    (teamRepository.verifyPermission as any).mockResolvedValue(false);

    await expect(useCase.execute(validDTO)).rejects.toThrow(
      "Permissão negada: Você não pode excluir despesas."
    );
    expect(expenseRepository.delete).not.toHaveBeenCalled();
  });
});
