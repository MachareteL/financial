import type { IIncomeRepository } from '@/domain/interfaces/income.repository.interface'
import type { DeleteIncomeDTO } from '@/domain/dto/income.types.d.ts'

export class DeleteIncomeUseCase {
  constructor(private incomeRepository: IIncomeRepository) {}

  async execute(dto: DeleteIncomeDTO): Promise<void> {
    await this.incomeRepository.delete(dto.incomeId, dto.teamId)
  }
}