import { Budget } from "../entities/budget";
import { DateUtils } from "@/domain/utils/date.utils";
import type { BudgetDetailsDTO, SaveBudgetDTO } from "../dto/budget.types.d.ts";
import type { Database } from "../dto/database.types.d.ts";
import { Mapper } from "../interfaces/mapper.interface";

type BudgetRow = Database["public"]["Tables"]["budgets"]["Row"];

export class BudgetMapperImplementation implements Mapper<
  Budget,
  BudgetDetailsDTO,
  SaveBudgetDTO
> {
  toDomain(raw: BudgetRow): Budget {
    return new Budget({
      id: raw.id,
      month: raw.month,
      year: raw.year,
      totalIncome: raw.total_income,
      teamId: raw.team_id || "",
      createdAt: DateUtils.parse(raw.created_at) || DateUtils.now(),
    });
  }

  toDTO(t: Budget): BudgetDetailsDTO {
    return {
      id: t.id,
      month: t.month,
      year: t.year,
      totalIncome: t.totalIncome,
    };
  }

  fromCreateDTO(dto: SaveBudgetDTO): Budget {
    // SaveBudgetDTO is effectively a Create/Update DTO
    return new Budget({
      id: crypto.randomUUID(),
      month: dto.month,
      year: dto.year,
      totalIncome: dto.totalIncome,
      teamId: dto.teamId,
      createdAt: DateUtils.now(),
    });
  }
}

export const BudgetMapper = new BudgetMapperImplementation();
