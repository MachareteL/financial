import type { IInvestmentRepository } from '@/domain/interfaces/investment.repository.interface'

export class DeleteInvestmentUseCase {
  constructor(private investmentRepository: IInvestmentRepository) {}

  async execute(id: string, teamId: string): Promise<void> {
    await this.investmentRepository.delete(id, teamId)
  }
}