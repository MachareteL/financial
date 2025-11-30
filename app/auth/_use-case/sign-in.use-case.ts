import type { SignInInputDTO } from "@/domain/dto/sign-in.dto";
import type { UserSession } from "@/domain/dto/user.types";
import type { IAuthRepository } from "@/domain/interfaces/auth.repository.interface";

import type { IAnalyticsService } from "@/domain/interfaces/analytics-service.interface";

export class SignInUseCase {
  constructor(
    private authRepository: IAuthRepository,
    private analyticsService: IAnalyticsService
  ) {}

  async execute(input: SignInInputDTO): Promise<UserSession> {
    if (!input.email || !input.password)
      throw new Error("Email e senha são obrigatórios");
    const session = await this.authRepository.signIn(
      input.email,
      input.password
    );

    // Fire-and-forget analytics
    this.analyticsService.identify(session.user.id, {
      email: session.user.email,
      name: session.user.name,
    });

    return session;
  }
}
