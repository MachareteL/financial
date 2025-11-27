import type { IAuthRepository } from "@/domain/interfaces/auth.repository.interface";
import type { UserSession } from "@/domain/dto/user.types";

export class VerifyRecoveryCodeUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(email: string, code: string): Promise<UserSession> {
    if (!email) throw new Error("O email é obrigatório.");
    if (!code || code.length !== 6)
      throw new Error("O código deve ter 6 dígitos.");

    return await this.authRepository.verifyRecoveryCode(email, code);
  }
}
