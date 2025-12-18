import { describe, it, expect } from "vitest";
import { BudgetCategoryMapper } from "./budget-category.mapper";
import { BudgetCategory } from "../entities/budget-category";

describe("BudgetCategoryMapper", () => {
  const rawData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Groceries",
    percentage: 0.3,
    teamId: "123e4567-e89b-12d3-a456-426614174001",
    createdAt: "2023-01-01T00:00:00.000Z",
  };

  const domainEntity = new BudgetCategory({
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Groceries",
    percentage: 0.3,
    teamId: "123e4567-e89b-12d3-a456-426614174001",
    createdAt: new Date("2023-01-01T00:00:00.000Z"),
  });

  it("should map to domain correctly", () => {
    const result = BudgetCategoryMapper.toDomain(rawData);
    expect(result).toBeInstanceOf(BudgetCategory);
    expect(result.id).toBe(rawData.id);
    expect(result.name).toBe(rawData.name);
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it("should map to DTO correctly", () => {
    const result = BudgetCategoryMapper.toDTO(domainEntity);
    expect(result.id).toBe(domainEntity.id);
    expect(result.name).toBe(domainEntity.name);
    expect(result.percentage).toBe(domainEntity.percentage);
  });

  it("should create domain from CreateDTO", () => {
    const createDto = {
      userId: "123e4567-e89b-12d3-a456-426614174002",
      teamId: "123e4567-e89b-12d3-a456-426614174001",
      name: "New Category",
      percentage: 0.2,
    };

    const result = BudgetCategoryMapper.fromCreateDTO(createDto);
    expect(result).toBeInstanceOf(BudgetCategory);
    expect(result.name).toBe(createDto.name);
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeDefined();
  });
});
