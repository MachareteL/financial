import type { SignInInputDTO } from "@/domain/dto/sign-in.dto";
import type { UserSession } from "@/domain/dto/user.types";
import type { IAuthRepository } from "@/domain/interfaces/auth.repository.interface";

import type { AnalyticsService } from "@/domain/interfaces/analytics-service.interface";

export class SignInUseCase {
  constructor(
    private authRepository: IAuthRepository,
    private analyticsService: AnalyticsService
  ) {}

  async execute(input: SignInInputDTO): Promise<UserSession> {
    if (!input.email || !input.password)
      throw new Error("Insira um email e senha válidos.");
    const session = await this.authRepository.signIn(
      input.email,
      input.password
    );

    if (session.user) {
      await this.analyticsService.identify(session.user.id, {
        email: session.user.email,
      });
    }

    return session;
  }
}
