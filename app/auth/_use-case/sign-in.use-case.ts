import type { SignInInputDTO } from "@/domain/dto/sign-in.dto";
import type { UserSession } from "@/domain/dto/user.types";
import type { IAuthRepository } from "@/domain/interfaces/auth.repository.interface";

import type { AnalyticsService } from "@/domain/interfaces/analytics-service.interface";
import { AuthApiError } from "@supabase/supabase-js";

export class SignInUseCase {
  constructor(
    private authRepository: IAuthRepository,
    private analyticsService: AnalyticsService
  ) {}

  async execute(input: SignInInputDTO): Promise<UserSession> {
    if (!input.email || !input.password)
      throw new Error("Insira um email e senha válidos.");

    try {
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
    } catch (error) {
      if (error instanceof AuthApiError) {
        switch (error.code) {
          case "invalid_credentials":
            throw new Error("Email ou senha incorretos.");
          default:
            throw new Error(error.message);
        }
      }
      throw error;
    }
  }
}
