import { describe, it, expect } from "vitest";
import { ExpenseMapper } from "./expense.mapper";
import { Expense } from "../entities/expense";

describe("ExpenseMapper", () => {
  const rawData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    amount: 150.5,
    description: "Lunch",
    date: "2023-01-01T00:00:00.000Z",
    team_id: "123e4567-e89b-12d3-a456-426614174001",
    user_id: "123e4567-e89b-12d3-a456-426614174002",
    category_id: "123e4567-e89b-12d3-a456-426614174003",
    receipt_url: "http://example.com/receipt.jpg",
    is_recurring: false,
    recurrence_type: null,
    created_at: "2023-01-01T00:00:00.000Z",
    is_installment: false,
  };

  const domainEntity = new Expense({
    id: "123e4567-e89b-12d3-a456-426614174000",
    amount: 150.5,
    description: "Lunch",
    date: new Date("2023-01-01T00:00:00.000Z"),
    teamId: "123e4567-e89b-12d3-a456-426614174001",
    userId: "123e4567-e89b-12d3-a456-426614174002",
    categoryId: "123e4567-e89b-12d3-a456-426614174003",
    receiptUrl: "http://example.com/receipt.jpg",
    createdAt: new Date("2023-01-01T00:00:00.000Z"),
    isRecurring: false,
    recurrenceType: null,
    isInstallment: false,
    installmentNumber: null,
    installmentValue: null,
    totalInstallments: null,
    parentExpenseId: null,
  });

  const createDto = {
    amount: 150.5,
    description: "Lunch",
    date: new Date("2023-01-01T00:00:00.000Z"),
    teamId: "123e4567-e89b-12d3-a456-426614174001",
    userId: "123e4567-e89b-12d3-a456-426614174002",
    categoryId: "123e4567-e89b-12d3-a456-426614174003",
    isRecurring: false,
    recurrenceType: null,
    isInstallment: false,
  };

  it("should map to domain correctly", () => {
    // @ts-expect-error - Partial mock
    const result = ExpenseMapper.toDomain(rawData);
    expect(result).toBeInstanceOf(Expense);
    expect(result.id).toBe(rawData.id);
    expect(result.amount).toBe(rawData.amount);
    expect(result.description).toBe(rawData.description);
    expect(result.date).toBeInstanceOf(Date);
  });

  it("should map to DTO correctly", () => {
    const result = ExpenseMapper.toDTO(domainEntity);
    expect(result.id).toBe(domainEntity.id);
    expect(result.amount).toBe(domainEntity.amount);
    expect(result.receiptUrl).toBe(domainEntity.receiptUrl);
  });

  it("should create domain from CreateDTO", () => {
    // @ts-expect-error - Partial mock
    const result = ExpenseMapper.fromCreateDTO(createDto);
    expect(result).toBeInstanceOf(Expense);
    expect(result.amount).toBe(createDto.amount);
    expect(result.id).toBeDefined();
  });
});
