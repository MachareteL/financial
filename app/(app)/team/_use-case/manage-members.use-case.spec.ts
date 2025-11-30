import { describe, it, expect, vi, beforeEach } from "vitest";
import { ManageMembersUseCase } from "./manage-members.use-case";
import { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import type {
  InviteMemberDTO,
  UpdateMemberRoleDTO,
} from "@/domain/dto/team.types.d.ts";

describe("ManageMembersUseCase", () => {
  let useCase: ManageMembersUseCase;
  let teamRepository: ITeamRepository;

  beforeEach(() => {
    teamRepository = {
      verifyPermission: vi.fn().mockResolvedValue(true),
      createTeamInvite: vi
        .fn()
        .mockResolvedValue({ id: "invite-1", status: "pending" }),
      updateMemberRole: vi.fn(),
      removeMember: vi.fn(),
      countMembersWithPermission: vi.fn().mockResolvedValue(2),
      deleteTeamInvite: vi.fn(),
    } as unknown as ITeamRepository;

    useCase = new ManageMembersUseCase(teamRepository);
  });

  const inviteDTO: InviteMemberDTO = {
    teamId: "123e4567-e89b-12d3-a456-426614174000",
    email: "new@member.com",
    roleId: "123e4567-e89b-12d3-a456-426614174003",
    invitedBy: "123e4567-e89b-12d3-a456-426614174001",
  };

  it("should invite member successfully", async () => {
    await useCase.inviteMember(inviteDTO);

    expect(teamRepository.verifyPermission).toHaveBeenCalledWith(
      inviteDTO.invitedBy,
      inviteDTO.teamId,
      "MANAGE_TEAM"
    );
    expect(teamRepository.createTeamInvite).toHaveBeenCalled();
  });

  it("should throw error if invite permission denied", async () => {
    (teamRepository.verifyPermission as any).mockResolvedValue(false);

    await expect(useCase.inviteMember(inviteDTO)).rejects.toThrow(
      "Permissão negada."
    );
    expect(teamRepository.createTeamInvite).not.toHaveBeenCalled();
  });

  const updateRoleDTO: UpdateMemberRoleDTO = {
    teamId: "123e4567-e89b-12d3-a456-426614174000",
    memberId: "123e4567-e89b-12d3-a456-426614174002",
    roleId: "123e4567-e89b-12d3-a456-426614174004",
    userId: "123e4567-e89b-12d3-a456-426614174001",
  };

  it("should update member role successfully", async () => {
    await useCase.updateMemberRole(updateRoleDTO);

    expect(teamRepository.verifyPermission).toHaveBeenCalledWith(
      updateRoleDTO.userId,
      updateRoleDTO.teamId,
      "MANAGE_TEAM"
    );
    expect(teamRepository.updateMemberRole).toHaveBeenCalled();
  });

  it("should remove member successfully", async () => {
    // Mock that the member being removed does NOT have MANAGE_TEAM permission
    // First call is for the user performing the action (has permission)
    // Second call is checking the target member permissions
    (teamRepository.verifyPermission as any)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    await useCase.removeMember(
      "123e4567-e89b-12d3-a456-426614174000",
      "123e4567-e89b-12d3-a456-426614174002",
      "123e4567-e89b-12d3-a456-426614174001"
    );

    expect(teamRepository.removeMember).toHaveBeenCalled();
  });

  it("should prevent removing last admin", async () => {
    // User has permission to remove
    // Target member HAS permission MANAGE_TEAM (is admin)
    (teamRepository.verifyPermission as any)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true);

    // Only 1 admin left
    (teamRepository.countMembersWithPermission as any).mockResolvedValue(1);

    await expect(
      useCase.removeMember(
        "123e4567-e89b-12d3-a456-426614174000",
        "123e4567-e89b-12d3-a456-426614174002",
        "123e4567-e89b-12d3-a456-426614174001"
      )
    ).rejects.toThrow("Promova outro membro antes.");

    expect(teamRepository.removeMember).not.toHaveBeenCalled();
  });
});
