import type { IAuthRepository } from "@/domain/interfaces/auth.repository.interface";

export class ResetPasswordUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(email: string): Promise<void> {
    if (!email)
      throw new Error("Precisamos do seu email para enviar o código.");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      throw new Error("Esse formato de email parece estranho. Pode conferir?");

    await this.authRepository.sendRecoveryCode(email);
  }
}
