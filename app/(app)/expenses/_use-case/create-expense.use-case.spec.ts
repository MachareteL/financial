import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { CreateExpenseUseCase } from "./create-expense.use-case";
import { IExpenseRepository } from "@/domain/interfaces/expense.repository.interface";
import { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import { IStorageRepository } from "@/domain/interfaces/storage.repository.interface";
import type { CreateExpenseDTO } from "@/domain/dto/expense.types.d.ts";
import { AnalyticsService } from "@/domain/interfaces/analytics-service.interface";

describe("CreateExpenseUseCase", () => {
  let useCase: CreateExpenseUseCase;
  let expenseRepository: IExpenseRepository;
  let teamRepository: ITeamRepository;
  let storageRepository: IStorageRepository;
  let analyticsService: AnalyticsService;

  beforeEach(() => {
    expenseRepository = {
      createMany: vi.fn(),
    } as unknown as IExpenseRepository;

    teamRepository = {
      verifyPermission: vi.fn().mockResolvedValue(true),
    } as unknown as ITeamRepository;

    storageRepository = {
      upload: vi.fn().mockResolvedValue("https://storage.com/receipt.png"),
    } as unknown as IStorageRepository;

    analyticsService = {
      track: vi.fn(),
    } as unknown as AnalyticsService;

    useCase = new CreateExpenseUseCase(
      expenseRepository,
      storageRepository,
      teamRepository,
      analyticsService
    );
  });

  const validDTO: CreateExpenseDTO = {
    userId: "123e4567-e89b-12d3-a456-426614174001",
    teamId: "123e4567-e89b-12d3-a456-426614174000",
    amount: 100,
    description: "Lunch",
    date: "2023-10-27",
    categoryId: "123e4567-e89b-12d3-a456-426614174002",
    isRecurring: false,
    isInstallment: false,
  };

  it("should create a single expense successfully", async () => {
    await useCase.execute(validDTO);

    expect(teamRepository.verifyPermission).toHaveBeenCalledWith(
      "123e4567-e89b-12d3-a456-426614174001",
      "123e4567-e89b-12d3-a456-426614174000",
      "MANAGE_EXPENSES"
    );
    expect(expenseRepository.createMany).toHaveBeenCalledTimes(1);
    const createdExpenses = (expenseRepository.createMany as Mock).mock
      .calls[0][0];
    expect(createdExpenses).toHaveLength(1);
    expect(createdExpenses[0].amount).toBe(100);
    expect(createdExpenses[0].description).toBe("Lunch");
  });

  it("should throw error if permission denied", async () => {
    (teamRepository.verifyPermission as Mock).mockResolvedValue(false);

    await expect(useCase.execute(validDTO)).rejects.toThrow(
      "Permissão negada: Você não pode criar despesas."
    );
    expect(expenseRepository.createMany).not.toHaveBeenCalled();
  });

  it("should create installment expenses correctly", async () => {
    const installmentDTO: CreateExpenseDTO = {
      ...validDTO,
      isInstallment: true,
      totalInstallments: 3,
      amount: 300, // Total amount
    };

    await useCase.execute(installmentDTO);

    expect(expenseRepository.createMany).toHaveBeenCalledTimes(1);
    const createdExpenses = (expenseRepository.createMany as Mock).mock
      .calls[0][0];
    expect(createdExpenses).toHaveLength(3);

    // Check individual installments
    expect(createdExpenses[0].amount).toBe(100); // 300 / 3
    expect(createdExpenses[0].installmentNumber).toBe(1);
    expect(createdExpenses[1].amount).toBe(100);
    expect(createdExpenses[1].installmentNumber).toBe(2);
    expect(createdExpenses[2].amount).toBe(100);
    expect(createdExpenses[2].installmentNumber).toBe(3);

    // Check dates (simplified check, assuming same day next month)
    const date1 = createdExpenses[0].date;
    const date2 = createdExpenses[1].date;
    expect(date2.getMonth()).toBe((date1.getMonth() + 1) % 12);
  });

  it("should handle receipt upload", async () => {
    const file = new File(["content"], "receipt.png", { type: "image/png" });
    const dtoWithReceipt = { ...validDTO, receiptFile: file };

    await useCase.execute(dtoWithReceipt);

    expect(storageRepository.upload).toHaveBeenCalled();
    const createdExpenses = (expenseRepository.createMany as Mock).mock
      .calls[0][0];
    expect(createdExpenses[0].receiptUrl).toBe(
      "https://storage.com/receipt.png"
    );
  });

  it("should continue without receipt if upload fails", async () => {
    (storageRepository.upload as Mock).mockRejectedValue(
      new Error("Upload failed")
    );
    const file = new File(["content"], "receipt.png", { type: "image/png" });
    const dtoWithReceipt = { ...validDTO, receiptFile: file };

    await useCase.execute(dtoWithReceipt);

    expect(storageRepository.upload).toHaveBeenCalled();
    const createdExpenses = (expenseRepository.createMany as Mock).mock
      .calls[0][0];
    expect(createdExpenses[0].receiptUrl).toBeNull();
  });
});
