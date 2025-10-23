import type { User } from "@/domain/entities/user"
import type { IAuthRepository } from "@/domain/interfaces/auth.repository"

export class GetCurrentAuthUserUseCase {
  constructor(private authRepository: IAuthRepository) {}
  async execute(): Promise<User | null> {
    return await this.authRepository.getCurrentAuthUser()
  }
}
