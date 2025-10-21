import type { IAuthRepository } from "@/domain/repositories/auth.repository.interface"

export interface SignInDTO {
  email: string
  password: string
}

export class SignInUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(dto: SignInDTO): Promise<{ userId: string; email: string }> {
    return await this.authRepository.signIn(dto.email, dto.password)
  }
}
