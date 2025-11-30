import { describe, it, expect } from "vitest";
import { BudgetCategory } from "./budget-category";

describe("BudgetCategory Entity", () => {
  it("should create a valid BudgetCategory", () => {
    const category = new BudgetCategory({
      id: "123e4567-e89b-12d3-a456-426614174000",
      teamId: "123e4567-e89b-12d3-a456-426614174001",
      name: "Necessities",
      percentage: 0.5,
      createdAt: new Date(),
    });

    expect(category).toBeInstanceOf(BudgetCategory);
    expect(category.name).toBe("Necessities");
    expect(category.percentage).toBe(0.5);
  });

  it("should throw error if name is empty", () => {
    expect(() => {
      new BudgetCategory({
        id: "123e4567-e89b-12d3-a456-426614174000",
        teamId: "123e4567-e89b-12d3-a456-426614174001",
        name: "",
        percentage: 0.5,
        createdAt: new Date(),
      });
    }).toThrow("O nome é obrigatório");
  });

  it("should throw error if percentage is out of range", () => {
    expect(() => {
      new BudgetCategory({
        id: "123e4567-e89b-12d3-a456-426614174000",
        teamId: "123e4567-e89b-12d3-a456-426614174001",
        name: "Savings",
        percentage: 1.5, // Invalid
        createdAt: new Date(),
      });
    }).toThrow();

    expect(() => {
      new BudgetCategory({
        id: "123e4567-e89b-12d3-a456-426614174000",
        teamId: "123e4567-e89b-12d3-a456-426614174001",
        name: "Savings",
        percentage: -0.1, // Invalid
        createdAt: new Date(),
      });
    }).toThrow();
  });

  it("should update properties correctly", () => {
    const category = new BudgetCategory({
      id: "123e4567-e89b-12d3-a456-426614174000",
      teamId: "123e4567-e89b-12d3-a456-426614174001",
      name: "Necessities",
      percentage: 0.5,
      createdAt: new Date(),
    });

    const updated = category.update({ name: "Essentials", percentage: 0.6 });

    expect(updated).toBeInstanceOf(BudgetCategory);
    expect(updated.id).toBe(category.id); // Should remain same
    expect(updated.name).toBe("Essentials");
    expect(updated.percentage).toBe(0.6);
  });
});
