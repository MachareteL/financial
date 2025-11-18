import type { IInvestmentRepository } from '@/domain/interfaces/investment.repository.interface'
import type { InvestmentDetailsDTO } from '@/domain/dto/investment.types.d.ts'

export class GetInvestmentsUseCase {
  constructor(private investmentRepository: IInvestmentRepository) {}

  async execute(teamId: string): Promise<InvestmentDetailsDTO[]> {
    const investments = await this.investmentRepository.findByTeamId(teamId)
    
    return investments.map(inv => ({
      id: inv.id,
      name: inv.name,
      type: inv.type,
      initialAmount: inv.initialAmount,
      currentAmount: inv.currentAmount,
      monthlyContribution: inv.monthlyContribution,
      annualReturnRate: inv.annualReturnRate,
      startDate: inv.startDate.toISOString().split('T')[0],
      teamId: inv.teamId,
    }))
  }
}