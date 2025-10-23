import { AuthSupabaseRepository } from "../repositories" 
import { SignInUseCase } from "@/app/auth/_use-case/sign-in.use-case"
import { SignUpUseCase } from "@/app/auth/_use-case/sign-up.use-case"
import { GetCurrentAuthUserUseCase } from "@/app/auth/_use-case/get-current-user.use-case"

const authRepository = new AuthSupabaseRepository()

export const signInUseCase = new SignInUseCase(authRepository)
export const signUpUseCase = new SignUpUseCase(authRepository)
export const getCurrentAuthUserUseCase = new GetCurrentAuthUserUseCase(authRepository)
