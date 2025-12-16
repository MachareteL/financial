import { UserSession } from "@/domain/dto/user.types";
import type { IAuthRepository } from "@/domain/interfaces/auth.repository.interface";

import { UserMapper } from "@/domain/mappers/user.mapper";

export class GetCurrentAuthUserUseCase {
  constructor(private authRepository: IAuthRepository) {}
  async execute(): Promise<UserSession | null> {
    const session = await this.authRepository.getCurrentAuthUser();
    if (!session) return null;
    return {
      ...session,
      user: UserMapper.toDTO(session.user as any),
    };
  }
}
