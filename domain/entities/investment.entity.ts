export interface Investment {
  id: string
  familyId: string
  userId: string
  name: string
  type: string
  amount: number
  currentValue: number
  purchaseDate: Date
  notes?: string
  createdAt: Date
}
