import type { SignInInputDTO } from "@/domain/dto/sign-in.dto" 
import type { UserSession } from "@/domain/dto/user.types" 
import type { IAuthRepository } from "@/domain/interfaces/auth.repository"

export class SignInUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(input: SignInInputDTO): Promise<UserSession> {
    if (!input.email || !input.password) throw new Error("Email e senha são obrigatórios")
    return await this.authRepository.signIn(input.email, input.password)
  }
}