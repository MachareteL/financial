import { describe, it, expect } from "vitest";
import { Subscription } from "./subscription";

describe("Subscription Entity", () => {
  const validProps = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    teamId: "123e4567-e89b-12d3-a456-426614174001",
    externalId: "sub_123",
    externalCustomerId: "cus_123",
    gatewayId: "stripe",
    status: "active" as const,
    planId: "price_123",
    currentPeriodEnd: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("should create a valid Subscription", () => {
    const subscription = new Subscription(validProps);
    expect(subscription).toBeInstanceOf(Subscription);
    expect(subscription.status).toBe("active");
  });

  it("should correctly identify active status", () => {
    const activeSub = new Subscription({ ...validProps, status: "active" });
    expect(activeSub.isActive()).toBe(true);

    const trialingSub = new Subscription({ ...validProps, status: "trialing" });
    expect(trialingSub.isActive()).toBe(true);
  });

  it("should correctly identify inactive status", () => {
    const canceledSub = new Subscription({ ...validProps, status: "canceled" });
    expect(canceledSub.isActive()).toBe(false);

    const pastDueSub = new Subscription({ ...validProps, status: "past_due" });
    expect(pastDueSub.isActive()).toBe(false);

    const unpaidSub = new Subscription({ ...validProps, status: "unpaid" });
    expect(unpaidSub.isActive()).toBe(false);
  });
});
