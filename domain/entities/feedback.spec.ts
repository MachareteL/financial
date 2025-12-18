import { describe, it, expect } from "vitest";
import { Feedback } from "./feedback";

describe("Feedback Entity", () => {
  const validProps = {
    // id: "123e4567-e89b-12d3-a456-426614174000",
    type: "suggestion" as const,
    title: "Add Dark Mode",
    description: "Please add a dark mode option to the settings.",
    email: "user@example.com",
    // userId: "123e4567-e89b-12d3-a456-426614174001",
    // createdAt: new Date(),
    status: "pending" as const,
  };

  it("should create a valid feedback", () => {
    const feedback = new Feedback(validProps);
    expect(feedback).toBeInstanceOf(Feedback);
    expect(feedback.type).toBe("suggestion");
  });

  it("should throw error if title is too short", () => {
    expect(() => {
      new Feedback({ ...validProps, title: "Hi", status: "pending" });
    }).toThrow("O título deve ter pelo menos 5 caracteres");
  });

  it("should throw error if description is too short", () => {
    expect(() => {
      new Feedback({ ...validProps, description: "Short", status: "pending" });
    }).toThrow("A descrição deve ter pelo menos 20 caracteres");
  });

  it("should throw error if email is invalid", () => {
    expect(() => {
      new Feedback({
        ...validProps,
        email: "invalid-email",
        status: "pending",
      });
    }).toThrow("Email inválido");
  });

  it("should create feedback without optional fields", () => {
    const feedback = new Feedback({
      type: "bug",
      title: "Login Error",
      description: "App crashes when clicking the submit button on the form.",
      status: "pending",
    });
    expect(feedback).toBeInstanceOf(Feedback);
    expect(feedback.email).toBeUndefined();
  });
});
