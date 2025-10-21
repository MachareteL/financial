import type { IUserRepository } from "@/domain/repositories/user.repository.interface"
import type { UserProfile } from "@/domain/entities/user.entity"

export class GetCurrentUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(): Promise<UserProfile | null> {
    const user = await this.userRepository.getCurrentUser()
    if (!user) return null

    return await this.userRepository.getUserProfile(user.id)
  }
}
