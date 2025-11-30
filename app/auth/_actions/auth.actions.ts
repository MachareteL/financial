"use server";

import {
  signInUseCase,
  signUpUseCase,
  resetPasswordUseCase,
  verifyRecoveryCodeUseCase,
  signOutUseCase,
} from "@/infrastructure/dependency-injection";
import { SignInInputDTO } from "@/domain/dto/sign-in.dto";
import { SignUpInputDTO } from "@/domain/dto/sign-up.dto";
import type { UserSession } from "@/domain/dto/user.types.d.ts";

export async function signInAction(
  input: SignInInputDTO
): Promise<UserSession> {
  return await signInUseCase.execute(input);
}

export async function signUpAction(input: SignUpInputDTO): Promise<void> {
  await signUpUseCase.execute(input);
}

export async function resetPasswordAction(email: string): Promise<void> {
  await resetPasswordUseCase.execute(email);
}

export async function verifyRecoveryCodeAction(
  email: string,
  code: string
): Promise<boolean> {
  return await verifyRecoveryCodeUseCase.execute(email, code);
}

export async function signOutAction(): Promise<void> {
  await signOutUseCase.execute();
}
