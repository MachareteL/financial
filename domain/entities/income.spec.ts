import { describe, it, expect } from "vitest";
import { Income } from "./income";

describe("Income Entity", () => {
  const validProps = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    amount: 5000,
    description: "Salary",
    type: "recurring" as const,
    frequency: "monthly" as const,
    date: new Date("2023-01-01"),
    teamId: "123e4567-e89b-12d3-a456-426614174001",
    userId: "123e4567-e89b-12d3-a456-426614174002",
    createdAt: new Date("2023-01-01"),
  };

  it("should create a valid Income", () => {
    const income = new Income(validProps);
    expect(income).toBeInstanceOf(Income);
    expect(income.amount).toBe(5000);
    expect(income.isMonthlyRecurring()).toBe(true);
  });

  it("should throw validation error for negative amount", () => {
    expect(() => {
      new Income({ ...validProps, amount: -100 });
    }).toThrow();
  });

  it("should allow null/undefined description and frequency", () => {
    const income = new Income({
      ...validProps,
      description: null,
      frequency: null,
      type: "one_time",
    });
    expect(income.description).toBeNull();
    expect(income.frequency).toBeNull();
  });

  it("isMonthlyRecurring should return false for weekly or one_time", () => {
    const weeklyIncome = new Income({ ...validProps, frequency: "weekly" });
    expect(weeklyIncome.isMonthlyRecurring()).toBe(false);

    const oneTimeIncome = new Income({
      ...validProps,
      type: "one_time",
      frequency: null,
    });
    expect(oneTimeIncome.isMonthlyRecurring()).toBe(false);
  });

  it("should update properties correctly", () => {
    const income = new Income(validProps);
    const updated = income.update({ amount: 6000 });
    expect(updated.amount).toBe(6000);
    expect(updated.id).toBe(income.id);
  });

  it("should reset frequency to null when updating type to one_time", () => {
    const income = new Income(validProps); // recurring monthly
    const updated = income.update({ type: "one_time" });

    expect(updated.type).toBe("one_time");
    expect(updated.frequency).toBeNull();
  });

  it("should keep frequency when updating type to recurring", () => {
    const income = new Income({
      ...validProps,
      type: "one_time",
      frequency: null,
    });
    const updated = income.update({ type: "recurring", frequency: "weekly" });

    expect(updated.type).toBe("recurring");
    expect(updated.frequency).toBe("weekly");
  });
});
