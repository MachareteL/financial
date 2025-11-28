import type { IAuthRepository } from "@/domain/interfaces/auth.repository.interface";
import type { UserSession } from "@/domain/dto/user.types";

export class UpdateProfileUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(userId: string, data: { name: string }): Promise<UserSession> {
    if (!userId) throw new Error("ID do usuário é obrigatório.");
    if (!data.name || data.name.trim().length < 2) {
      throw new Error("O nome deve ter pelo menos 2 caracteres.");
    }

    return await this.authRepository.updateProfile(userId, data);
  }
}
