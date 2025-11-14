import { Container } from "./container";
import { AuthSupabaseRepository, UserRepository, CategoryRepository, TeamRepository, ExpenseRepository } from "../repositories";
import { SignInUseCase } from "@/app/auth/_use-case/sign-in.use-case";
import { SignUpUseCase } from "@/app/auth/_use-case/sign-up.use-case";
import { GetCurrentAuthUserUseCase } from "@/app/auth/_use-case/get-current-user.use-case";
import { SignOutUseCase } from "@/app/auth/_use-case/sign-out.use-case";
import { CreateTeamUseCase } from "@/app/team/_use-case/create-team.use-case";
import { GetDashboardDataUseCase } from "@/app/dashboard/_use-case/get-dashboard-data.use-case";
import { SupabaseIncomeRepository } from "../repositories/supabase-income.repository";
import { CreateExpenseUseCase } from "@/app/expenses/_use-case/create-expense.use-case";
import { GetCategoriesUseCase } from "@/app/categories/_use-case/get-categories.use-case";

const container = Container.getInstance();

const authRepository = container.get("authRepository", () => new AuthSupabaseRepository());
const userRepository = container.get("userRepository", () => new UserRepository());
const categoryRepository = container.get("categoryRepository", () => new CategoryRepository());
const teamRepository = container.get("teamRepository", () => new TeamRepository());
const expenseRepository = container.get("expenseRepository", () => new ExpenseRepository());
const incomeRepository = container.get("incomeRepository", () => new SupabaseIncomeRepository());

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

export const signOutUseCase = container.get(
  "signOutUseCase",
  () => new SignOutUseCase(new AuthSupabaseRepository())
);

export const createTeamUseCase = container.get(
  "createTeamUseCase",
  () => new CreateTeamUseCase(teamRepository, categoryRepository)
);

export const getDashboardDataUseCase = container.get(
  "getDashboardDataUseCase",
  () => new GetDashboardDataUseCase(expenseRepository, incomeRepository)
);

export const createExpenseUseCase = container.get(
  "createExpenseUseCase",
  () => new CreateExpenseUseCase(expenseRepository)
);

export const getCategoriesUseCase = container.get(
  "getCategoriesUseCase",
  () => new GetCategoriesUseCase(categoryRepository)
);