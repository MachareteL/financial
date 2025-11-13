import { UserSession } from "@/domain/dto/user.types"
import type { IAuthRepository } from "@/domain/interfaces/auth.repository"

export class GetCurrentAuthUserUseCase {
  constructor(private authRepository: IAuthRepository) {}
  async execute(): Promise<UserSession | null> {
    return await this.authRepository.getCurrentAuthUser()
  }
}
