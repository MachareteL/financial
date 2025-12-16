import type { IInvestmentRepository } from "@/domain/interfaces/investment.repository.interface";
import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import type { UpdateInvestmentDTO } from "@/domain/dto/investment.types.d.ts";
import { DateUtils } from "@/domain/utils/date.utils";

export class UpdateInvestmentUseCase {
  constructor(
    private investmentRepository: IInvestmentRepository,
    private teamRepository: ITeamRepository
  ) {}

  async execute(dto: UpdateInvestmentDTO): Promise<void> {
    const hasPermission = await this.teamRepository.verifyPermission(
      dto.userId,
      dto.teamId,
      "MANAGE_INVESTMENTS"
    );

    if (!hasPermission) {
      throw new Error("Permissão negada: Você não pode editar investimentos.");
    }
    const existing = await this.investmentRepository.findById(
      dto.investmentId,
      dto.teamId
    );
    if (!existing) throw new Error("Investimento não encontrado");

    const updated = existing.update({
      name: dto.name,
      type: dto.type,
      initialAmount: dto.initialAmount,
      currentAmount: dto.currentAmount,
      monthlyContribution: dto.monthlyContribution,
      annualReturnRate: dto.annualReturnRate,
      startDate: dto.startDate
        ? DateUtils.parse(dto.startDate) || undefined
        : undefined,
    });

    await this.investmentRepository.update(updated);
  }
}
