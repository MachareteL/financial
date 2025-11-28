import type { IInvestmentRepository } from "@/domain/interfaces/investment.repository.interface";
import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import type { DeleteInvestmentDTO } from "@/domain/dto/investment.types.d.ts";

export class DeleteInvestmentUseCase {
  constructor(
    private investmentRepository: IInvestmentRepository,
    private teamRepository: ITeamRepository
  ) {}

  async execute(dto: DeleteInvestmentDTO): Promise<void> {
    const hasPermission = await this.teamRepository.verifyPermission(
      dto.userId,
      dto.teamId,
      "MANAGE_INVESTMENTS"
    );

    if (!hasPermission) {
      throw new Error("Permissão negada: Você não pode excluir investimentos.");
    }
    await this.investmentRepository.delete(dto.investmentId, dto.teamId);
  }
}
