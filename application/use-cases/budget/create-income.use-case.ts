import type { IIncomeRepository } from "@/domain/repositories/income.repository"
import { Income } from "@/domain/entities/income.entity"

export interface CreateIncomeInput {
  amount: number
  description: string
  type: "recurring" | "one_time"
  frequency?: "monthly" | "weekly" | "yearly"
  date: Date
  familyId: string
  userId: string
}

export class CreateIncomeUseCase {
  constructor(private incomeRepository: IIncomeRepository) {}

  async execute(input: CreateIncomeInput): Promise<void> {
    const income = new Income(
      crypto.randomUUID(),
      input.amount,
      input.description,
      input.type,
      input.date,
      input.familyId,
      input.userId,
      input.frequency,
    )

    await this.incomeRepository.create(income)
  }
}
