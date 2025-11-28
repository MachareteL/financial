import type { IInvestmentRepository } from "@/domain/interfaces/investment.repository.interface";
import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import type { CreateInvestmentDTO } from "@/domain/dto/investment.types.d.ts";
import { Investment } from "@/domain/entities/investment";

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
    const investment = new Investment({
      id: crypto.randomUUID(),
      createdAt: new Date(),
      teamId: dto.teamId,
      name: dto.name,
      type: dto.type,
      initialAmount: dto.initialAmount,
      currentAmount: dto.currentAmount,
      monthlyContribution: dto.monthlyContribution,
      annualReturnRate: dto.annualReturnRate,
      startDate: new Date(
        dto.startDate ? dto.startDate.replace(/-/g, "/") : new Date()
      ), // Ajuste na data
    });

    await this.investmentRepository.create(investment);
  }
}
