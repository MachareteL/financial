import { describe, it, expect, vi, beforeEach } from "vitest";
import { UpdateExpenseUseCase } from "./update-expense.use-case";
import { IExpenseRepository } from "@/domain/interfaces/expense.repository.interface";
import { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import { IStorageRepository } from "@/domain/interfaces/storage.repository.interface";
import type { UpdateExpenseDTO } from "@/domain/dto/expense.types.d.ts";
import { Expense } from "@/domain/entities/expense";

describe("UpdateExpenseUseCase", () => {
  let useCase: UpdateExpenseUseCase;
  let expenseRepository: IExpenseRepository;
  let teamRepository: ITeamRepository;
  let storageRepository: IStorageRepository;

  beforeEach(() => {
    expenseRepository = {
      findById: vi.fn(),
      update: vi.fn(),
    } as unknown as IExpenseRepository;

    teamRepository = {
      verifyPermission: vi.fn().mockResolvedValue(true),
    } as unknown as ITeamRepository;

    storageRepository = {
      upload: vi.fn().mockResolvedValue("https://storage.com/new-receipt.png"),
    } as unknown as IStorageRepository;

    useCase = new UpdateExpenseUseCase(
      expenseRepository,
      storageRepository,
      teamRepository
    );
  });

  const validDTO: UpdateExpenseDTO = {
    expenseId: "123e4567-e89b-12d3-a456-426614174000",
    teamId: "123e4567-e89b-12d3-a456-426614174001",
    userId: "123e4567-e89b-12d3-a456-426614174002",
    amount: 200,
    description: "Updated Lunch",
  };

  const existingExpense = new Expense({
    id: "123e4567-e89b-12d3-a456-426614174000",
    teamId: "123e4567-e89b-12d3-a456-426614174001",
    userId: "123e4567-e89b-12d3-a456-426614174002",
    amount: 100,
    description: "Lunch",
    date: new Date(),
    categoryId: "123e4567-e89b-12d3-a456-426614174003",
    createdAt: new Date(),
    isRecurring: false,
    isInstallment: false,
  });

  it("should update expense details successfully", async () => {
    (expenseRepository.findById as any).mockResolvedValue(existingExpense);

    await useCase.execute(validDTO);

    expect(teamRepository.verifyPermission).toHaveBeenCalledWith(
      validDTO.userId,
      validDTO.teamId,
      "MANAGE_EXPENSES"
    );
    expect(expenseRepository.update).toHaveBeenCalled();
    const updatedExpense = (expenseRepository.update as any).mock.calls[0][0];
    expect(updatedExpense.amount).toBe(200);
    expect(updatedExpense.description).toBe("Updated Lunch");
  });

  it("should update receipt if file provided", async () => {
    (expenseRepository.findById as any).mockResolvedValue(existingExpense);
    const file = new File(["content"], "new.png", { type: "image/png" });
    const dtoWithFile = { ...validDTO, receiptFile: file };

    await useCase.execute(dtoWithFile);

    expect(storageRepository.upload).toHaveBeenCalled();
    const updatedExpense = (expenseRepository.update as any).mock.calls[0][0];
    expect(updatedExpense.receiptUrl).toBe(
      "https://storage.com/new-receipt.png"
    );
  });

  it("should throw error if permission denied", async () => {
    (teamRepository.verifyPermission as any).mockResolvedValue(false);

    await expect(useCase.execute(validDTO)).rejects.toThrow(
      "Permissão negada: Você não pode editar despesas."
    );
    expect(expenseRepository.update).not.toHaveBeenCalled();
  });

  it("should throw error if expense not found", async () => {
    (expenseRepository.findById as any).mockResolvedValue(null);

    await expect(useCase.execute(validDTO)).rejects.toThrow(
      "Gasto não encontrado ou você não tem permissão"
    );
    expect(expenseRepository.update).not.toHaveBeenCalled();
  });
});
