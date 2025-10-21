import type { IAuthRepository } from "@/domain/repositories/auth.repository.interface"
import type { IUserRepository } from "@/domain/repositories/user.repository.interface"

export interface SignUpDTO {
  email: string
  password: string
  name: string
}

export class SignUpUseCase {
  constructor(
    private authRepository: IAuthRepository,
    private userRepository: IUserRepository,
  ) {}

  async execute(dto: SignUpDTO): Promise<{ userId: string; email: string }> {
    // Sign up with auth provider
    const authUser = await this.authRepository.signUp(dto.email, dto.password)

    // Create user profile
    await this.userRepository.createProfile({
      id: authUser.userId,
      email: dto.email,
      name: dto.name,
      familyId: null,
    })

    return authUser
  }
}
