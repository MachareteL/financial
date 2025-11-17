import { Container } from "./container";
import {
  AuthSupabaseRepository,
  UserRepository,
  CategoryRepository,
  TeamRepository,
  ExpenseRepository,
  BudgetRepository
} from "../repositories";

// Auth
import { SignInUseCase } from "@/app/auth/_use-case/sign-in.use-case";
import { SignUpUseCase } from "@/app/auth/_use-case/sign-up.use-case";
import { GetCurrentAuthUserUseCase } from "@/app/auth/_use-case/get-current-user.use-case";
import { SignOutUseCase } from "@/app/auth/_use-case/sign-out.use-case";
import { CreateTeamUseCase } from "@/app/team/_use-case/create-team.use-case";

// Dashboard
import { GetDashboardDataUseCase } from "@/app/dashboard/_use-case/get-dashboard-data.use-case";

// Expenses
import { CreateExpenseUseCase } from "@/app/expenses/_use-case/create-expense.use-case";
import { GetCategoriesUseCase } from "@/app/categories/_use-case/get-categories.use-case";
import { GetExpensesUseCase } from "@/app/expenses/_use-case/get-expenses.use-case";
import { DeleteExpenseUseCase } from "@/app/expenses/_use-case/delete-expense.use-case";
import { GetExpenseSummaryByPeriodUseCase } from "@/app/expenses/_use-case/get-expense-summary-by-period.use-case"; // <-- NOVO

// Incomes (Exemplo, corrija os paths se estiverem errados)
import { GetIncomesUseCase } from "@/app/income/_use_case/get-income.use-case";
import { CreateIncomeUseCase } from "@/app/income/_use_case/create-income.use-case";
import { UpdateIncomeUseCase } from "@/app/income/_use_case/update-income.use-case";
import { DeleteIncomeUseCase } from "@/app/income/_use_case/delete-income.use-case"; // <-- NOVO

// Budget
import { GetBudgetUseCase } from "@/app/budget/_use-case/get-budget.use-case"; // <-- NOVO
import { SaveBudgetUseCase } from "@/app/budget/_use-case/save-budget.use-case"; // <-- NOVO
import { StorageRepository } from "../repositories/supabase.storage.repository";
import { SupabaseIncomeRepository } from "../repositories/supabase-income.repository";

const container = Container.getInstance();


const authRepository = container.get(
  "authRepository",
  () => new AuthSupabaseRepository()
);
const userRepository = container.get(
  "userRepository",
  () => new UserRepository()
);
const categoryRepository = container.get(
  "categoryRepository",
  () => new CategoryRepository()
);
const teamRepository = container.get(
  "teamRepository",
  () => new TeamRepository()
);
const expenseRepository = container.get(
  "expenseRepository",
  () => new ExpenseRepository()
);
const incomeRepository = container.get(
  "incomeRepository",
  () => new SupabaseIncomeRepository()
);
const storageRepository = container.get(
  "storageRepository",
  () => new StorageRepository()
);
const budgetRepository = container.get(
  "budgetRepository",
  () => new BudgetRepository()
);


// Auth
export const getCurrentAuthUserUseCase = container.get(
  "getCurrentAuthUserUseCase",
  () => new GetCurrentAuthUserUseCase(authRepository)
);
export const signInUseCase = container.get(
  "signInUseCase",
  () => new SignInUseCase(authRepository)
);
export const signUpUseCase = container.get(
  "signUpUseCase",
  () => new SignUpUseCase(authRepository)
);
export const signOutUseCase = container.get(
  "signOutUseCase",
  () => new SignOutUseCase(authRepository)
);

// Team
export const createTeamUseCase = container.get(
  "createTeamUseCase",
  () => new CreateTeamUseCase(teamRepository, categoryRepository)
);

// Dashboard
export const getDashboardDataUseCase = container.get(
  "getDashboardDataUseCase",
  () => new GetDashboardDataUseCase(expenseRepository, incomeRepository)
);

// Expenses
export const createExpenseUseCase = container.get(
  "createExpenseUseCase",
  () => new CreateExpenseUseCase(expenseRepository, storageRepository)
);
export const getCategoriesUseCase = container.get(
  "getCategoriesUseCase",
  () => new GetCategoriesUseCase(categoryRepository)
);
export const getExpensesUseCase = container.get(
  "getExpensesUseCase",
  () => new GetExpensesUseCase(expenseRepository)
);
export const deleteExpenseUseCase = container.get(
  "deleteExpenseUseCase",
  () => new DeleteExpenseUseCase(expenseRepository)
);
export const getExpenseSummaryByPeriodUseCase = container.get(
  "getExpenseSummaryByPeriodUseCase",
  () => new GetExpenseSummaryByPeriodUseCase(expenseRepository)
);

// Incomes
export const getIncomesUseCase = container.get(
  "getIncomesUseCase",
  () => new GetIncomesUseCase(incomeRepository)
);
export const createIncomeUseCase = container.get(
  "createIncomeUseCase",
  () => new CreateIncomeUseCase(incomeRepository)
);

export const updateIncomeUseCase = container.get(
  "updateIncomeUseCase",
  () => new UpdateIncomeUseCase(incomeRepository)
);

export const deleteIncomeUseCase = container.get(
  "deleteIncomeUseCase",
  () => new DeleteIncomeUseCase(incomeRepository)
);

// Budget
export const getBudgetUseCase = container.get(
  "getBudgetUseCase",
  () => new GetBudgetUseCase(budgetRepository)
);
export const saveBudgetUseCase = container.get(
  "saveBudgetUseCase",
  () => new SaveBudgetUseCase(budgetRepository)
);
