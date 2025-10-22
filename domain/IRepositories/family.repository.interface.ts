import type { FamilyMember, FamilyRole, FamilyInvite } from "../Entities/family-member.entity"

export interface IFamilyRepository {
  getFamilyMembers(familyId: string): Promise<FamilyMember[]>
  getFamilyRoles(familyId: string): Promise<FamilyRole[]>
  createFamilyRole(role: Omit<FamilyRole, "id" | "createdAt">): Promise<FamilyRole>
  updateFamilyRole(roleId: string, familyId: string, data: Partial<FamilyRole>): Promise<FamilyRole>
  deleteFamilyRole(roleId: string, familyId: string): Promise<void>
  getFamilyInvites(familyId: string): Promise<FamilyInvite[]>
  createFamilyInvite(invite: Omit<FamilyInvite, "id" | "createdAt">): Promise<FamilyInvite>
  updateFamilyInvite(inviteId: string, familyId: string, status: FamilyInvite["status"]): Promise<FamilyInvite>
}
