"use server";

import {
  updateProfileUseCase,
  updatePasswordUseCase,
} from "@/infrastructure/dependency-injection";
import type { UserSession } from "@/domain/dto/user.types.d.ts";

export async function updateProfileAction(
  userId: string,
  data: { name: string }
): Promise<UserSession> {
  return await updateProfileUseCase.execute(userId, data);
}

export async function updatePasswordAction(password: string): Promise<void> {
  await updatePasswordUseCase.execute(password);
}
