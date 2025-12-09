import type { IAuthRepository } from "@/domain/interfaces/auth.repository.interface";

export class UpdatePasswordUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(password: string): Promise<void> {
    if (password.length < 6) {
      throw new Error(
        "Sua senha nova precisa ter pelo menos 6 caracteres para ser segura."
      );
    }
    await this.authRepository.updatePassword(password);
  }
}
