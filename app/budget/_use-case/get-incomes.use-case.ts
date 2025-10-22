import type { IIncomeRepository } from "@/domain/IRepositories/income.repository"

export interface GetIncomesInput {
  familyId: string
}

export interface IncomeOutput {
  id: string
  amount: number
  description: string
  type: "recurring" | "one_time"
  frequency?: "monthly" | "weekly" | "yearly"
  date: Date
  userId: string
  userName: string | null
}

export class GetIncomesUseCase {
  constructor(private incomeRepository: IIncomeRepository) {}

  async execute(input: GetIncomesInput): Promise<IncomeOutput[]> {
    const incomes = await this.incomeRepository.findByFamilyId(input.familyId)
    return incomes.map((income) => ({
      id: income.id,
      amount: income.amount,
      description: income.description,
      type: income.type,
      frequency: income.frequency,
      date: income.date,
      userId: income.userId,
      userName: income.userName || null,
    }))
  }
}
