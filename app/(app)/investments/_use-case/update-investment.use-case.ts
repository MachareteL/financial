import type { IInvestmentRepository } from '@/domain/interfaces/investment.repository.interface'
import type { UpdateInvestmentDTO } from '@/domain/dto/investment.types.d.ts'

export class UpdateInvestmentUseCase {
  constructor(private investmentRepository: IInvestmentRepository) {}

  async execute(dto: UpdateInvestmentDTO): Promise<void> {
    const existing = await this.investmentRepository.findById(dto.investmentId, dto.teamId)
    if (!existing) throw new Error("Investimento não encontrado")

    const updated = existing.update({
      name: dto.name,
      type: dto.type,
      initialAmount: dto.initialAmount,
      currentAmount: dto.currentAmount,
      monthlyContribution: dto.monthlyContribution,
      annualReturnRate: dto.annualReturnRate,
      startDate: dto.startDate ? new Date(dto.startDate.replace(/-/g, '/')) : undefined,
    })
    
    await this.investmentRepository.update(updated)
  }
}