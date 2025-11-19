import { Container } from "./container";
import {
  AuthSupabaseRepository,
  CategoryRepository,
  TeamRepository,
  ExpenseRepository,
  BudgetRepository,
  StorageRepository,
  IncomeRepository,
  InvestmentRepository,
  BudgetCategoryRepository,
} from "../repositories";

// Auth
import { SignInUseCase } from "@/app/auth/_use-case/sign-in.use-case";
import { SignUpUseCase } from "@/app/auth/_use-case/sign-up.use-case";
import { GetCurrentAuthUserUseCase } from "@/app/auth/_use-case/get-current-user.use-case";
import { SignOutUseCase } from "@/app/auth/_use-case/sign-out.use-case";
import { CreateTeamUseCase } from "@/app/(app)/team/_use-case/create-team.use-case";

// Dashboard
import { GetDashboardDataUseCase } from "@/app/(app)/dashboard/_use-case/get-dashboard-data.use-case";

// Expenses
import { CreateExpenseUseCase } from "@/app/(app)/expenses/_use-case/create-expense.use-case";
import { GetExpensesUseCase } from "@/app/(app)/expenses/_use-case/get-expenses.use-case";
import { DeleteExpenseUseCase } from "@/app/(app)/expenses/_use-case/delete-expense.use-case";
import { GetExpenseSummaryByPeriodUseCase } from "@/app/(app)/expenses/_use-case/get-expense-summary-by-period.use-case";

// Incomes
import { GetIncomesUseCase } from "@/app/(app)/income/_use_case/get-income.use-case";
import { CreateIncomeUseCase } from "@/app/(app)/income/_use_case/create-income.use-case";
import { UpdateIncomeUseCase } from "@/app/(app)/income/_use_case/update-income.use-case";
import { DeleteIncomeUseCase } from "@/app/(app)/income/_use_case/delete-income.use-case";

// Budget
import { GetBudgetUseCase } from "@/app/(app)/budget/_use-case/get-budget.use-case";
import { SaveBudgetUseCase } from "@/app/(app)/budget/_use-case/save-budget.use-case";
import { GetBudgetCategoriesUseCase } from "@/app/(app)/budget/_use-case/get-budget-categories.use-case";

// Categories
import { GetCategoriesUseCase } from "@/app/(app)/categories/_use-case/get-categories.use-case";
import { CreateCategoryUseCase } from "@/app/(app)/categories/_use-case/create-category.use-case";
import { UpdateCategoryUseCase } from "@/app/(app)/categories/_use-case/update-category.use-case";
import { DeleteCategoryUseCase } from "@/app/(app)/categories/_use-case/delete-category.use-case";
import { CreateBudgetCategoryUseCase } from "@/app/(app)/budget/_use-case/create-budget-category.use-case";
import { UpdateBudgetCategoryUseCase } from "@/app/(app)/budget/_use-case/update-budget-category.use-case";
import { DeleteBudgetCategoryUseCase } from "@/app/(app)/budget/_use-case/delete-budget-category.use-case";

// Investments
import { GetInvestmentsUseCase } from "@/app/(app)/investments/_use-case/get-investments.use-case";
import { CreateInvestmentUseCase } from "@/app/(app)/investments/_use-case/create-investment.use-case";
import { UpdateInvestmentUseCase } from "@/app/(app)/investments/_use-case/update-investment.use-case";
import { DeleteInvestmentUseCase } from "@/app/(app)/investments/_use-case/delete-investment.use-case";

// Team Management
import { GetTeamDataUseCase } from "@/app/(app)/team/_use-case/get-team-data.use-case";
import { ManageRolesUseCase } from "@/app/(app)/team/_use-case/manage-roles.use-case";
import { ManageMembersUseCase } from "@/app/(app)/team/_use-case/manage-members.use-case";
import { GetExpenseByIdUseCase } from "@/app/(app)/expenses/_use-case/get-expense-by-id.use-case";
import { UpdateExpenseUseCase } from "@/app/(app)/expenses/_use-case/update-expense.use-case";

// Services
import { GeminiAiService } from "../services/gemini-ai.service";

// AI Use Cases
import { ParseReceiptUseCase } from "@/app/(app)/expenses/_use-case/parse-receipt.use-case";

const container = Container.getInstance();

const authRepository = container.get(
  "authRepository",
  () => new AuthSupabaseRepository()
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
  () => new IncomeRepository()
);
const storageRepository = container.get(
  "storageRepository",
  () => new StorageRepository()
);
const budgetRepository = container.get(
  "budgetRepository",
  () => new BudgetRepository()
);
const budgetCategoryRepository = container.get(
  "budgetCategoryRepository",
  () => new BudgetCategoryRepository()
);
const investmentRepository = container.get(
  "investmentRepository",
  () => new InvestmentRepository()
);

// Services
const aiService = container.get(
  "aiService",
  () => new GeminiAiService(process.env.GOOGLE_API_KEY!, process.env.GOOGLE_GEMINI_MODEL)
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
  () =>
    new CreateTeamUseCase(
      teamRepository,
      categoryRepository,
      budgetCategoryRepository
    )
);

// Dashboard
export const getDashboardDataUseCase = container.get(
  "getDashboardDataUseCase",
  () =>
    new GetDashboardDataUseCase(
      expenseRepository,
      budgetRepository,
      budgetCategoryRepository
    )
);

// Expenses
export const getExpenseByIdUseCase = container.get(
  "getExpenseByIdUseCase",
  () => new GetExpenseByIdUseCase(expenseRepository)
);
export const createExpenseUseCase = container.get(
  "createExpenseUseCase",
  () => new CreateExpenseUseCase(expenseRepository, storageRepository)
);
export const getExpensesUseCase = container.get(
  "getExpensesUseCase",
  () => new GetExpensesUseCase(expenseRepository)
);
export const deleteExpenseUseCase = container.get(
  "deleteExpenseUseCase",
  () => new DeleteExpenseUseCase(expenseRepository)
);
export const updateExpenseUseCase = container.get(
  "updateExpenseUseCase",
  () => new UpdateExpenseUseCase(expenseRepository, storageRepository)
);
export const getExpenseSummaryByPeriodUseCase = container.get(
  "getExpenseSummaryByPeriodUseCase",
  () =>
    new GetExpenseSummaryByPeriodUseCase(
      expenseRepository,
      budgetCategoryRepository
    )
);

// Categories
export const getCategoriesUseCase = container.get(
  "getCategoriesUseCase",
  () => new GetCategoriesUseCase(categoryRepository)
);
export const createCategoryUseCase = container.get(
  "createCategoryUseCase",
  () => new CreateCategoryUseCase(categoryRepository)
);
export const updateCategoryUseCase = container.get(
  "updateCategoryUseCase",
  () => new UpdateCategoryUseCase(categoryRepository)
);
export const deleteCategoryUseCase = container.get(
  "deleteCategoryUseCase",
  () => new DeleteCategoryUseCase(categoryRepository)
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
export const getBudgetCategoriesUseCase = container.get(
  "getBudgetCategoriesUseCase",
  () => new GetBudgetCategoriesUseCase(budgetCategoryRepository)
);
export const createBudgetCategoryUseCase = container.get(
  "createBudgetCategoryUseCase",
  () => new CreateBudgetCategoryUseCase(budgetCategoryRepository)
);
export const updateBudgetCategoryUseCase = container.get(
  "updateBudgetCategoryUseCase",
  () => new UpdateBudgetCategoryUseCase(budgetCategoryRepository)
);
export const deleteBudgetCategoryUseCase = container.get(
  "deleteBudgetCategoryUseCase",
  () => new DeleteBudgetCategoryUseCase(budgetCategoryRepository)
);

// Investments
export const getInvestmentsUseCase = container.get(
  "getInvestmentsUseCase",
  () => new GetInvestmentsUseCase(investmentRepository)
);
export const createInvestmentUseCase = container.get(
  "createInvestmentUseCase",
  () => new CreateInvestmentUseCase(investmentRepository)
);
export const updateInvestmentUseCase = container.get(
  "updateInvestmentUseCase",
  () => new UpdateInvestmentUseCase(investmentRepository)
);
export const deleteInvestmentUseCase = container.get(
  "deleteInvestmentUseCase",
  () => new DeleteInvestmentUseCase(investmentRepository)
);

// Team Management
export const getTeamDataUseCase = container.get(
  "getTeamDataUseCase",
  () => new GetTeamDataUseCase(teamRepository)
);

export const manageRolesUseCase = container.get(
  "manageRolesUseCase",
  () => new ManageRolesUseCase(teamRepository)
);

export const manageMembersUseCase = container.get(
  "manageMembersUseCase",
  () => new ManageMembersUseCase(teamRepository)
);

// AI
export const parseReceiptUseCase = container.get(
  "parseReceiptUseCase",
  () => new ParseReceiptUseCase(aiService)
);