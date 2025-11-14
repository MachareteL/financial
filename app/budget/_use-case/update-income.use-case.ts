import type { IIncomeRepository } from "@/domain/interfaces/income.repository.interface"

export interface UpdateIncomeInput {
  incomeId: string
  amount: number
  description: string
  type: "recurring" | "one_time"
  frequency?: "monthly" | "weekly" | "yearly"
  date: Date
  familyId: string
}

export class UpdateIncomeUseCase {
  constructor(private incomeRepository: IIncomeRepository) {}

  async execute(input: UpdateIncomeInput): Promise<void> {
    const income = await this.incomeRepository.findById(input.incomeId)

    if (!income) {
      throw new Error("Receita não encontrada")
    }

    if (income.familyId !== input.familyId) {
      throw new Error("Você não tem permissão para atualizar esta receita")
    }

    income.amount = input.amount
    income.description = input.description
    income.type = input.type
    income.frequency = input.frequency
    income.date = input.date

    await this.incomeRepository.update(income)
  }
}
