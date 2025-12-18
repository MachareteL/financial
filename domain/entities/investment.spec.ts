import { describe, it, expect } from "vitest";
import { Investment } from "./investment";

describe("Investment Entity", () => {
  const validProps = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Apple Stocks",
    type: "stocks" as const,
    initialAmount: 10000,
    currentAmount: 12000,
    monthlyContribution: 500,
    annualReturnRate: 10.5,
    startDate: new Date("2023-01-01"),
    teamId: "123e4567-e89b-12d3-a456-426614174001",
    createdAt: new Date("2023-01-01"),
  };

  it("should create a valid Investment", () => {
    const investment = new Investment(validProps);
    expect(investment).toBeInstanceOf(Investment);
    expect(investment.name).toBe("Apple Stocks");
    expect(investment.currentAmount).toBe(12000);
  });

  it("should throw validation error for negative amounts", () => {
    expect(() => {
      new Investment({ ...validProps, initialAmount: -100 });
    }).toThrow();

    expect(() => {
      new Investment({ ...validProps, currentAmount: -1 });
    }).toThrow();

    expect(() => {
      new Investment({ ...validProps, monthlyContribution: -50 });
    }).toThrow();
  });

  it("should throw validation error for missing name", () => {
    expect(() => {
      new Investment({ ...validProps, name: "" });
    }).toThrow("O nome é obrigatório");
  });

  it("should update properties correctly", () => {
    const investment = new Investment(validProps);
    const updated = investment.update({
      currentAmount: 13000,
      annualReturnRate: 11,
    });

    expect(updated.currentAmount).toBe(13000);
    expect(updated.annualReturnRate).toBe(11);
    expect(updated.id).toBe(investment.id);
  });
});
