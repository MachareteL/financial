import type { IUserRepository } from "@/domain/interfaces/user.repository.interface"
import type { ICategoryRepository } from "@/domain/interfaces/category.repository.interface"
import type { Family } from "@/domain/entities/user"

export interface CreateFamilyDTO {
  familyName: string
  userId: string
}

export class CreateFamilyUseCase {
  constructor(
    private userRepository: IUserRepository,
    private categoryRepository: ICategoryRepository,
  ) {}

  async execute(dto: CreateFamilyDTO): Promise<Family> {
    // Check if user already has a family
    const userProfile = await this.userRepository.getUserProfile(dto.userId)
    if (userProfile?.familyId) {
      throw new Error("User already belongs to a family")
    }

    // Create family
    const family = await this.userRepository.createFamily(dto.familyName, dto.userId)

    // Create default categories
    await this.categoryRepository.createDefaultCategories(family.id)

    return family
  }
}
