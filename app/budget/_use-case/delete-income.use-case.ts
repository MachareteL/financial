import type { IIncomeRepository } from "@/domain/repositories/income.repository"

export interface DeleteIncomeInput {
  incomeId: string
  familyId: string
}

export class DeleteIncomeUseCase {
  constructor(private incomeRepository: IIncomeRepository) {}

  async execute(input: DeleteIncomeInput): Promise<void> {
    const income = await this.incomeRepository.findById(input.incomeId)

    if (!income) {
      throw new Error("Receita não encontrada")
    }

    if (income.familyId !== input.familyId) {
      throw new Error("Você não tem permissão para excluir esta receita")
    }

    await this.incomeRepository.delete(input.incomeId)
  }
}
