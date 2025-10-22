import type { IAuthRepository } from "@/domain/IRepositories/IAuth.repository"

export class SignOutUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(): Promise<void> {
    await this.authRepository.signOut()
  }
}
