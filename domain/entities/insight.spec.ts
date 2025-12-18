import { describe, it, expect } from "vitest";
import { Insight } from "./insight";

describe("Insight Entity", () => {
  const validProps = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    teamId: "123e4567-e89b-12d3-a456-426614174001",
    type: "BUDGET_ALERT" as const,
    title: "Over Budget Alert",
    content: "You have exceeded your food budget by $50.",
    createdAt: new Date(),
    isRead: false,
    actionUrl: "/budget",
  };

  it("should create a valid Insight", () => {
    const insight = new Insight(validProps);
    expect(insight).toBeInstanceOf(Insight);
    expect(insight.title).toBe("Over Budget Alert");
    expect(insight.isRead).toBe(false);
  });

  it("markAsRead should set isRead to true", () => {
    const insight = new Insight(validProps);
    const readInsight = insight.markAsRead();

    expect(readInsight.isRead).toBe(true);
    // original should remain unchanged (immutability check if desired, though logic replaces props)
  });

  it("should throw validation error for missing title", () => {
    expect(() => {
      new Insight({ ...validProps, title: "" });
    }).toThrow();
  });
});
