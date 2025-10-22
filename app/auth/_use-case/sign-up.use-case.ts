import type { IAuthRepository } from "@/domain/IRepositories/IAuth.repository"
import type { IUserRepository } from "@/domain/IRepositories/user.repository.interface"

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
