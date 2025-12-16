import { DateUtils } from "@/domain/utils/date.utils";
import { BudgetCategory } from "../entities/budget-category";
import type {
  BudgetCategoryDetailsDTO,
  CreateBudgetCategoryDTO,
} from "../dto/budget-category.types.d.ts";
import { Mapper } from "../interfaces/mapper.interface";

export class BudgetCategoryMapperImplementation implements Mapper<
  BudgetCategory,
  BudgetCategoryDetailsDTO,
  CreateBudgetCategoryDTO
> {
  toDomain(raw: any): BudgetCategory {
    return new BudgetCategory({
      id: raw.id,
      name: raw.name,
      percentage: raw.percentage,
      teamId: raw.teamId,
      createdAt: DateUtils.parse(raw.createdAt) || DateUtils.now(),
    });
  }

  toDTO(domain: BudgetCategory): BudgetCategoryDetailsDTO {
    return {
      id: domain.id,
      name: domain.name,
      percentage: domain.percentage,
    };
  }

  fromCreateDTO(dto: CreateBudgetCategoryDTO): BudgetCategory {
    return new BudgetCategory({
      id: crypto.randomUUID(),
      createdAt: DateUtils.now(),
      name: dto.name,
      percentage: dto.percentage,
      teamId: dto.teamId,
    });
  }
}

export const BudgetCategoryMapper = new BudgetCategoryMapperImplementation();
