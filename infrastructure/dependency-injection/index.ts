import { Container } from "./container"
import { AuthSupabaseRepository } from "../repositories"
import { SignInUseCase } from "@/app/auth/_use-case/sign-in.use-case"
import { SignUpUseCase } from "@/app/auth/_use-case/sign-up.use-case"
import { GetCurrentAuthUserUseCase } from "@/app/auth/_use-case/get-current-user.use-case"

const container = Container.getInstance()

export const getCurrentAuthUserUseCase = container.get(
  "getCurrentAuthUserUseCase",
  () => new GetCurrentAuthUserUseCase(new AuthSupabaseRepository())
)

export const signInUseCase = container.get(
  "signInUseCase",
  () => new SignInUseCase(new AuthSupabaseRepository())
)

export const signUpUseCase = container.get(
  "signUpUseCase",
  () => new SignUpUseCase(new AuthSupabaseRepository())
)
