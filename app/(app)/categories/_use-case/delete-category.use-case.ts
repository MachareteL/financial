import type { ICategoryRepository } from "@/domain/interfaces/category.repository.interface";
import type { DeleteCategoryDTO } from "@/domain/dto/category.types.d.ts";

import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";

export class DeleteCategoryUseCase {
  constructor(
    private categoryRepository: ICategoryRepository,
    private teamRepository: ITeamRepository
  ) {}

  async execute(dto: DeleteCategoryDTO): Promise<void> {
    const hasPermission = await this.teamRepository.verifyPermission(
      dto.userId,
      dto.teamId,
      "MANAGE_BUDGET"
    );
    if (!hasPermission) throw new Error("Permissão negada.");

    await this.categoryRepository.delete(dto.categoryId, dto.teamId);
  }
}
