import type { IBudgetRepository } from "@/domain/interfaces/budget.repository.interface";
import type {
  BudgetDetailsDTO,
  GetBudgetDTO,
} from "@/domain/dto/budget.types.d.ts";
import { BudgetMapper } from "@/domain/mappers/budget.mapper";
export class GetBudgetUseCase {
  constructor(private budgetRepository: IBudgetRepository) {}

  async execute(dto: GetBudgetDTO): Promise<BudgetDetailsDTO | null> {
    const budget = await this.budgetRepository.findByTeamAndPeriod(
      dto.teamId,
      dto.month,
      dto.year
    );

    if (!budget) {
      return null;
    }

    return BudgetMapper.toDTO(budget);
  }
}
