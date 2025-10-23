import type { SignUpInputDTO } from "@/domain/dto/sign-up.dto" 
import type { User } from "@/domain/entities/user"
import type { IAuthRepository } from "@/domain/interfaces/auth.repository"
import { UserSchema } from "@/domain/entities/user"

export class SignUpUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(input: SignUpInputDTO): Promise<User> {
    if (!input.email || !input.password || !input.name) {
      throw new Error("Todos os campos são obrigatórios")
    }
    
    const rawUser = await this.authRepository.signUp(input.email, input.password, input.name)

    UserSchema.parse(rawUser)
    return rawUser
  }
}
