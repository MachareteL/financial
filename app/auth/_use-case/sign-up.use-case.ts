import type { User } from "@/domain/entities/user";
import type { IAuthRepository } from "@/domain/interfaces/auth.repository.interface";

import {
  SignUpInputSchema,
  type SignUpInputDTO,
} from "@/domain/dto/sign-up.dto";

import type { IAnalyticsService } from "@/domain/interfaces/analytics-service.interface";

export class SignUpUseCase {
  constructor(
    private authRepository: IAuthRepository,
    private analyticsService: IAnalyticsService
  ) {}

  async execute(input: SignUpInputDTO): Promise<User> {
    const validation = SignUpInputSchema.safeParse(input);

    if (!validation.success) {
      throw new Error(validation.error.errors[0].message);
    }

    const user = await this.authRepository.signUp(
      validation.data.email,
      validation.data.password,
      validation.data.name
    );

    // Fire-and-forget analytics
    this.analyticsService.identify(user.id, {
      email: user.email,
      name: user.name,
      plan_status: "free", // Default to free on signup
    });

    return user;
  }
}
