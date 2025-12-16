import { Category } from "../entities/category";
import { DateUtils } from "@/domain/utils/date.utils";
import type {
  CategoryDetailsDTO,
  CreateCategoryDTO,
} from "../dto/category.types.d.ts";
import { Mapper } from "../interfaces/mapper.interface";

export class CategoryMapperImplementation implements Mapper<
  Category,
  CategoryDetailsDTO,
  CreateCategoryDTO
> {
  toDomain(raw: any): Category {
    return new Category({
      id: raw.id,
      name: raw.name,
      budgetCategoryId: raw.budgetCategoryId,
      teamId: raw.teamId,
      createdAt: DateUtils.parse(raw.createdAt) || DateUtils.now(),
      budgetCategory: raw.budgetCategory,
    });
  }

  toDTO(t: Category): CategoryDetailsDTO {
    return {
      id: t.id,
      name: t.name,
      budgetCategoryId: t.budgetCategoryId,
      budgetCategoryName: t.budgetCategory ? t.budgetCategory.name : null,
    };
  }

  fromCreateDTO(dto: CreateCategoryDTO): Category {
    return new Category({
      id: crypto.randomUUID(),
      name: dto.name,
      budgetCategoryId: dto.budgetCategoryId,
      teamId: dto.teamId,
      createdAt: DateUtils.now(),
    });
  }
}

export const CategoryMapper = new CategoryMapperImplementation();
