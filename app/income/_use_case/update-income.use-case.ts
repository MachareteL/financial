import type { IIncomeRepository } from '@/domain/interfaces/income.repository.interface'
import type { UpdateIncomeDTO } from '@/domain/dto/income.types.d.ts'

export class UpdateIncomeUseCase {
  constructor(private incomeRepository: IIncomeRepository) {}

  async execute(dto: UpdateIncomeDTO): Promise<void> {
    const existingIncome = await this.incomeRepository.findById(dto.incomeId, dto.teamId)

    if (!existingIncome) {
      throw new Error('Receita não encontrada ou você não tem permissão')
    }

    const updatedIncome = existingIncome.update({
      amount: dto.amount,
      description: dto.description,
      type: dto.type,
      frequency: dto.frequency,
      date: new Date(dto.date.replace(/-/g, '/')),
    })

    await this.incomeRepository.update(updatedIncome)
  }
}