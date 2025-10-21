export interface User {
  id: string
  email: string
  name: string
  familyId: string | null
  createdAt: Date
}

export interface UserProfile extends User {
  family: Family | null
}

export interface Family {
  id: string
  name: string
  createdAt: Date
}
