import type { User } from "@/domain/entities/user";
import type { UserDTO } from "@/domain/dto/user.types.d.ts";
import { UserMapper } from "@/domain/mappers/user.mapper";
import type { IAuthRepository } from "@/domain/interfaces/auth.repository.interface";

import {
  SignUpInputSchema,
  type SignUpInputDTO,
} from "@/domain/dto/sign-up.dto";

import type { AnalyticsService } from "@/domain/interfaces/analytics-service.interface";

export class SignUpUseCase {
  constructor(
    private authRepository: IAuthRepository,
    private analyticsService: AnalyticsService
  ) {}

  async execute(input: SignUpInputDTO): Promise<UserDTO> {
    const validation = SignUpInputSchema.safeParse(input);

    if (!validation.success) {
      throw new Error(validation.error.errors[0].message);
    }

    const user = await this.authRepository.signUp(
      validation.data.email,
      validation.data.password,
      validation.data.name
    );

    await this.analyticsService.identify(user.id, {
      email: user.email,
      name: user.name,
    });

    return UserMapper.toDTO(user);
  }
}
