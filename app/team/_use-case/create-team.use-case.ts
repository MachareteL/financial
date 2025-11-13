import type { ICategoryRepository } from "@/domain/interfaces/category.repository.interface";
import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import type { Team } from "@/domain/entities/team";

export interface CreateTeamDTO {
  teamName: string;
  userId: string;
}

export class CreateTeamUseCase {
  constructor(
    private teamRepository: ITeamRepository,
    private categoryRepository: ICategoryRepository,
  ) {}

  async execute(dto: CreateTeamDTO): Promise<Team> {

    const team = await this.teamRepository.createTeam(dto.teamName, dto.userId);

    await this.categoryRepository.createDefaultCategories(team.id);

    return team;
  }
}