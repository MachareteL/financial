import type { IAuthRepository } from "@/domain/interfaces/auth.repository.interface";
import type { UserSession } from "@/domain/dto/user.types";

export class UpdateProfileUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(userId: string, data: { name: string }): Promise<UserSession> {
    if (!userId)
      throw new Error(
        "Não conseguimos identificar você. Tente recarregar a página."
      );
    if (!data.name || data.name.trim().length < 2) {
      throw new Error(
        "Seu nome precisa ser um pouquinho maior (mínimo 2 letras)."
      );
    }

    return await this.authRepository.updateProfile(userId, data);
  }
}
