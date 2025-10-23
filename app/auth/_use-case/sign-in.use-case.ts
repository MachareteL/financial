import type { SignInInputDTO } from "@/domain/dto/sign-in.dto" 
import type { User } from "@/domain/entities/user"
import type { IAuthRepository } from "@/domain/interfaces/auth.repository"
import { UserSchema } from "@/domain/entities/user"

export class SignInUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(input: SignInInputDTO): Promise<User> {
    if (!input.email || !input.password) throw new Error("Email e senha são obrigatórios")

    const rawUser = await this.authRepository.signIn(input.email, input.password)
    
    // UserSchema.parse(rawUser)
    return rawUser
  }
}
