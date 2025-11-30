"use server";

import { getCurrentAuthUserUseCase } from "@/infrastructure/dependency-injection";
import type { UserSession } from "@/domain/dto/user.types.d.ts";

export async function getCurrentUserAction(): Promise<UserSession | null> {
  try {
    return await getCurrentAuthUserUseCase.execute();
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
