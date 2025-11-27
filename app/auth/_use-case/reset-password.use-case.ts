import type { IAuthRepository } from "@/domain/interfaces/auth.repository.interface";

export class ResetPasswordUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(email: string): Promise<void> {
    if (!email) throw new Error("O email é obrigatório.");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new Error("Formato de email inválido.");

    await this.authRepository.sendRecoveryCode(email);
  }
}
