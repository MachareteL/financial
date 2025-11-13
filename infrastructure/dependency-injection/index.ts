import { Container } from "./container";
import { AuthSupabaseRepository, UserRepository, CategoryRepository, TeamRepository } from "../repositories";
import { SignInUseCase } from "@/app/auth/_use-case/sign-in.use-case";
import { SignUpUseCase } from "@/app/auth/_use-case/sign-up.use-case";
import { GetCurrentAuthUserUseCase } from "@/app/auth/_use-case/get-current-user.use-case";
import { SignOutUseCase } from "@/app/auth/_use-case/sign-out.use-case";
import { CreateTeamUseCase } from "@/app/team/_use-case/create-team.use-case";

const container = Container.getInstance();

const authRepository = container.get("authRepository", () => new AuthSupabaseRepository());
const userRepository = container.get("userRepository", () => new UserRepository());
const categoryRepository = container.get("categoryRepository", () => new CategoryRepository());
const teamRepository = container.get("teamRepository", () => new TeamRepository());

export const getCurrentAuthUserUseCase = container.get(
  "getCurrentAuthUserUseCase",
  () => new GetCurrentAuthUserUseCase(new AuthSupabaseRepository())
);

export const signInUseCase = container.get(
  "signInUseCase",
  () => new SignInUseCase(new AuthSupabaseRepository())
);

export const signUpUseCase = container.get(
  "signUpUseCase",
  () => new SignUpUseCase(new AuthSupabaseRepository())
);

export const createTeamUseCase = container.get(
  "createTeamUseCase",
  () => new CreateTeamUseCase(teamRepository, categoryRepository)
);
