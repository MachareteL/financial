import type { ICategoryRepository } from "@/domain/interfaces/category.repository.interface";
import type { CreateCategoryDTO } from "@/domain/dto/category.types.d.ts";
import { CategoryMapper } from "@/domain/mappers/category.mapper";

import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";

export class CreateCategoryUseCase {
  constructor(
    private categoryRepository: ICategoryRepository,
    private teamRepository: ITeamRepository
  ) {}

  async execute(dto: CreateCategoryDTO): Promise<void> {
    const hasPermission = await this.teamRepository.verifyPermission(
      dto.userId,
      dto.teamId,
      "MANAGE_BUDGET"
    );
    if (!hasPermission) throw new Error("Permissão negada.");

    const category = CategoryMapper.fromCreateDTO(dto);

    await this.categoryRepository.create(category);
  }
}
