import { Category } from "../entities/category";
import { DateUtils } from "@/domain/utils/date.utils";
import type {
  CategoryDetailsDTO,
  CreateCategoryDTO,
} from "../dto/category.types.d.ts";
import type { Database } from "../dto/database.types.d.ts";
import { Mapper } from "../interfaces/mapper.interface";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type CategoryWithRelations = CategoryRow & {
  budget_category?: { name: string } | null;
};

export class CategoryMapperImplementation implements Mapper<
  Category,
  CategoryDetailsDTO,
  CreateCategoryDTO
> {
  toDomain(raw: CategoryWithRelations): Category {
    return new Category({
      id: raw.id,
      name: raw.name,
      budgetCategoryId: raw.budget_category_id || "",
      teamId: raw.team_id || "",
      createdAt: DateUtils.parse(raw.created_at) || DateUtils.now(),
      budgetCategory: undefined,
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
