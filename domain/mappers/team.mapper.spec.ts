import { describe, it, expect } from "vitest";
import { TeamMapper } from "./team.mapper";
import { Team } from "../entities/team";

describe("TeamMapper", () => {
  const rawData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "My Team",
    created_by: "123e4567-e89b-12d3-a456-426614174001",
    created_at: "2023-01-01T00:00:00.000Z",
    trial_ends_at: null,
  };

  const domainEntity = new Team({
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "My Team",
    createdBy: "123e4567-e89b-12d3-a456-426614174001",
    createdAt: new Date("2023-01-01T00:00:00.000Z"),
    trialEndsAt: null,
  });

  it("should map to domain correctly", () => {
    const result = TeamMapper.toDomain(rawData);
    expect(result).toBeInstanceOf(Team);
    expect(result.id).toBe(rawData.id);
    expect(result.name).toBe(rawData.name);
    expect(result.createdBy).toBe(rawData.created_by);
  });

  it("should map to DTO correctly", () => {
    const result = TeamMapper.toDTO(domainEntity);
    expect(result.id).toBe(domainEntity.id);
    expect(result.name).toBe(domainEntity.name);
    expect(result.createdBy).toBe(domainEntity.createdBy);
  });
});
