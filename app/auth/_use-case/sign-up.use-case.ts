import type { User } from "@/domain/entities/user";
import type { IAuthRepository } from "@/domain/interfaces/auth.repository.interface";

import { SignUpInputSchema, type SignUpInputDTO } from "@/domain/dto/sign-up.dto"

export class SignUpUseCase {
  constructor(private authRepository: IAuthRepository) {}

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

    return user;
  }
}