import { describe, it, expect } from "vitest";
import { TeamRole } from "./team-role";

describe("TeamRole Entity", () => {
  const validProps = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Admin",
    description: "Administrator with full access",
    color: "#FF0000",
    permissions: ["MANAGE_TEAM", "MANAGE_BUDGET"],
    teamId: "123e4567-e89b-12d3-a456-426614174001",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("should create a valid TeamRole", () => {
    const role = new TeamRole(validProps);
    expect(role).toBeInstanceOf(TeamRole);
    expect(role.name).toBe("Admin");
    expect(role.permissions).toContain("MANAGE_TEAM");
  });

  it("should throw validation error for invalid color", () => {
    expect(() => {
      new TeamRole({ ...validProps, color: "red" }); // too short
    }).toThrow();
  });

  it("should throw validation error for empty name", () => {
    expect(() => {
      new TeamRole({ ...validProps, name: "" });
    }).toThrow();
  });
});
