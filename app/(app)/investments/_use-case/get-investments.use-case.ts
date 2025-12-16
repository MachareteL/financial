import type { IInvestmentRepository } from "@/domain/interfaces/investment.repository.interface";
import type { InvestmentDetailsDTO } from "@/domain/dto/investment.types.d.ts";
import { InvestmentMapper } from "@/domain/mappers/investment.mapper";

export class GetInvestmentsUseCase {
  constructor(private investmentRepository: IInvestmentRepository) {}

  async execute(teamId: string): Promise<InvestmentDetailsDTO[]> {
    const investments = await this.investmentRepository.findByTeamId(teamId);

    return investments.map(InvestmentMapper.toDTO);
  }
}
