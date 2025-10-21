export interface FamilyMember {
  id: string
  name: string
  email: string
  familyId: string
  role?: FamilyRole
}

export interface FamilyRole {
  id: string
  familyId: string
  userId: string
  role: string
  permissions: string[]
  createdAt: Date
}

export interface FamilyInvite {
  id: string
  familyId: string
  email: string
  invitedBy: string
  status: "pending" | "accepted" | "rejected"
  createdAt: Date
}
