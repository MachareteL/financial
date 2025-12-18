import type { IInvestmentRepository } from "@/domain/interfaces/investment.repository.interface";
import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import type { CreateInvestmentDTO } from "@/domain/dto/investment.types.d.ts";
import { InvestmentMapper } from "@/domain/mappers/investment.mapper";

export class CreateInvestmentUseCase {
  constructor(
    private investmentRepository: IInvestmentRepository,
    private teamRepository: ITeamRepository
  ) {}

  async execute(dto: CreateInvestmentDTO): Promise<void> {
    const hasPermission = await this.teamRepository.verifyPermission(
      dto.userId,
      dto.teamId,
      "MANAGE_INVESTMENTS"
    );

    if (!hasPermission) {
      throw new Error("Permissão negada: Você não pode criar investimentos.");
    }
    const investment = InvestmentMapper.fromCreateDTO(dto);

    await this.investmentRepository.create(investment);
  }
}
