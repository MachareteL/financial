import { Container } from "./container";
import { ClientAnalyticsService } from "@/infrastructure/services/client-analytics.service";
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
  SupabaseSubscriptionRepository,
} from "../repositories";

// Auth
import { SignInUseCase } from "@/app/auth/_use-case/sign-in.use-case";
import { SignUpUseCase } from "@/app/auth/_use-case/sign-up.use-case";
import { GetCurrentAuthUserUseCase } from "@/app/auth/_use-case/get-current-user.use-case";
import { SignOutUseCase } from "@/app/auth/_use-case/sign-out.use-case";
import { CreateTeamUseCase } from "@/app/(app)/team/_use-case/create-team.use-case";
import { UpdateTeamUseCase } from "@/app/(app)/team/_use-case/update-team.use-case";
import { ResetPasswordUseCase } from "@/app/auth/_use-case/reset-password.use-case";
import { UpdatePasswordUseCase } from "@/app/auth/_use-case/update-password.use-case";
import { VerifyRecoveryCodeUseCase } from "@/app/auth/_use-case/verify-recovery-code.use-case";

// Dashboard
import { GetDashboardDataUseCase } from "@/app/(app)/dashboard/_use-case/get-dashboard-data.use-case";

// Expenses
import { CreateExpenseUseCase } from "@/app/(app)/expenses/_use-case/create-expense.use-case";
import { GetExpensesUseCase } from "@/app/(app)/expenses/_use-case/get-expenses.use-case";
import { DeleteExpenseUseCase } from "@/app/(app)/expenses/_use-case/delete-expense.use-case";
import { GetExpenseSummaryByPeriodUseCase } from "@/app/(app)/expenses/_use-case/get-expense-summary-by-period.use-case";
import { GetExpensesSummaryUseCase } from "@/app/(app)/expenses/_use-case/get-expenses-summary.use-case";

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
import { SimulateInvestmentGrowthUseCase } from "@/app/(app)/investments/_use-case/simulate-investment-growth.use-case";

// Team Management
import { GetTeamDataUseCase } from "@/app/(app)/team/_use-case/get-team-data.use-case";
import { ManageRolesUseCase } from "@/app/(app)/team/_use-case/manage-roles.use-case";
import { ManageMembersUseCase } from "@/app/(app)/team/_use-case/manage-members.use-case";
import { GetExpenseByIdUseCase } from "@/app/(app)/expenses/_use-case/get-expense-by-id.use-case";
import { UpdateExpenseUseCase } from "@/app/(app)/expenses/_use-case/update-expense.use-case";

// Profile
import { UpdateProfileUseCase } from "@/app/auth/_use-case/update-profile.use-case";

// Team Invites (Onboarding)
import { GetPendingInvitesUseCase } from "@/app/(app)/team/_use-case/get-pending-invites.use-case";
import { AcceptInviteUseCase } from "@/app/(app)/team/_use-case/accept-invite.use-case";
import { DeclineInviteUseCase } from "@/app/(app)/team/_use-case/decline-invite.use-case";
// Services
import { GeminiAiService } from "@/infrastructure/services/gemini-ai.service";
import { ResendEmailService } from "@/infrastructure/services/resend-email.service";

// Feedback
import { SendFeedbackUseCase } from "@/app/(app)/feedback/_use-case/send-feedback.use-case";

// AI Use Cases
import { ParseReceiptUseCase } from "@/app/(app)/expenses/_use-case/parse-receipt.use-case";

// Subscription & Billing
import { CheckFeatureAccessUseCase } from "@/app/(app)/team/_use-case/check-feature-access.use-case";

import { createBrowserClient } from "@supabase/ssr";

const container = Container.getInstance();

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const authRepository = container.get(
  "authRepository",
  () => new AuthSupabaseRepository(supabase)
);
const categoryRepository = container.get(
  "categoryRepository",
  () => new CategoryRepository(supabase)
);
const teamRepository = container.get(
  "teamRepository",
  () => new TeamRepository(supabase)
);
const expenseRepository = container.get(
  "expenseRepository",
  () => new ExpenseRepository(supabase)
);
const incomeRepository = container.get(
  "incomeRepository",
  () => new IncomeRepository(supabase)
);
const storageRepository = container.get(
  "storageRepository",
  () => new StorageRepository(supabase)
);
const budgetRepository = container.get(
  "budgetRepository",
  () => new BudgetRepository(supabase)
);
const budgetCategoryRepository = container.get(
  "budgetCategoryRepository",
  () => new BudgetCategoryRepository(supabase)
);
const investmentRepository = container.get(
  "investmentRepository",
  () => new InvestmentRepository(supabase)
);

// Services
const aiService = container.get(
  "aiService",
  () =>
    new GeminiAiService(
      process.env.GOOGLE_API_KEY!,
      process.env.GOOGLE_GEMINI_MODEL
    )
);

import { SupabaseFeedbackRepository } from "@/infrastructure/repositories/supabase-feedback.repository";

// ...

const emailService = new ResendEmailService(process.env.RESEND_API_KEY || "");
const feedbackRepository = new SupabaseFeedbackRepository(supabase);

export const sendFeedbackUseCase = new SendFeedbackUseCase(
  emailService,
  feedbackRepository
);

const subscriptionRepository = container.get(
  "subscriptionRepository",
  () => new SupabaseSubscriptionRepository(supabase)
);

// Auth
export const getCurrentAuthUserUseCase = container.get(
  "getCurrentAuthUserUseCase",
  () => new GetCurrentAuthUserUseCase(authRepository)
);
export const signInUseCase = container.get(
  "signInUseCase",
  () => new SignInUseCase(authRepository, new ClientAnalyticsService())
);
export const signUpUseCase = container.get(
  "signUpUseCase",
  () => new SignUpUseCase(authRepository, new ClientAnalyticsService())
);
export const signOutUseCase = container.get(
  "signOutUseCase",
  () => new SignOutUseCase(authRepository)
);
export const resetPasswordUseCase = container.get(
  "resetPasswordUseCase",
  () => new ResetPasswordUseCase(authRepository)
);
export const updatePasswordUseCase = container.get(
  "updatePasswordUseCase",
  () => new UpdatePasswordUseCase(authRepository)
);

export const verifyRecoveryCodeUseCase = container.get(
  "verifyRecoveryCodeUseCase",
  () => new VerifyRecoveryCodeUseCase(authRepository)
);

export const updateProfileUseCase = container.get(
  "updateProfileUseCase",
  () => new UpdateProfileUseCase(authRepository)
);

// Team
export const createTeamUseCase = container.get(
  "createTeamUseCase",
  () =>
    new CreateTeamUseCase(
      teamRepository,
      categoryRepository,
      budgetCategoryRepository,
      subscriptionRepository
    )
);

export const updateTeamUseCase = container.get(
  "updateTeamUseCase",
  () => new UpdateTeamUseCase(teamRepository)
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
  () =>
    new CreateExpenseUseCase(
      expenseRepository,
      storageRepository,
      teamRepository,
      new ClientAnalyticsService()
    )
);
export const getExpensesUseCase = container.get(
  "getExpensesUseCase",
  () => new GetExpensesUseCase(expenseRepository)
);
export const deleteExpenseUseCase = container.get(
  "deleteExpenseUseCase",
  () => new DeleteExpenseUseCase(expenseRepository, teamRepository)
);
export const updateExpenseUseCase = container.get(
  "updateExpenseUseCase",
  () =>
    new UpdateExpenseUseCase(
      expenseRepository,
      storageRepository,
      teamRepository
    )
);
export const getExpenseSummaryByPeriodUseCase = container.get(
  "getExpenseSummaryByPeriodUseCase",
  () =>
    new GetExpenseSummaryByPeriodUseCase(
      expenseRepository,
      budgetCategoryRepository
    )
);

export const getExpensesSummaryUseCase = container.get(
  "getExpensesSummaryUseCase",
  () => new GetExpensesSummaryUseCase(expenseRepository)
);

// Categories
export const getCategoriesUseCase = container.get(
  "getCategoriesUseCase",
  () => new GetCategoriesUseCase(categoryRepository)
);
export const createCategoryUseCase = container.get(
  "createCategoryUseCase",
  () => new CreateCategoryUseCase(categoryRepository, teamRepository)
);
export const updateCategoryUseCase = container.get(
  "updateCategoryUseCase",
  () => new UpdateCategoryUseCase(categoryRepository, teamRepository)
);
export const deleteCategoryUseCase = container.get(
  "deleteCategoryUseCase",
  () => new DeleteCategoryUseCase(categoryRepository, teamRepository)
);

// Incomes
export const getIncomesUseCase = container.get(
  "getIncomesUseCase",
  () => new GetIncomesUseCase(incomeRepository)
);
export const createIncomeUseCase = container.get(
  "createIncomeUseCase",
  () => new CreateIncomeUseCase(incomeRepository, teamRepository)
);

export const updateIncomeUseCase = container.get(
  "updateIncomeUseCase",
  () => new UpdateIncomeUseCase(incomeRepository, teamRepository)
);

export const deleteIncomeUseCase = container.get(
  "deleteIncomeUseCase",
  () => new DeleteIncomeUseCase(incomeRepository, teamRepository)
);

// Budget
export const getBudgetUseCase = container.get(
  "getBudgetUseCase",
  () => new GetBudgetUseCase(budgetRepository)
);
export const saveBudgetUseCase = container.get(
  "saveBudgetUseCase",
  () => new SaveBudgetUseCase(budgetRepository, teamRepository)
);
export const getBudgetCategoriesUseCase = container.get(
  "getBudgetCategoriesUseCase",
  () => new GetBudgetCategoriesUseCase(budgetCategoryRepository)
);
export const createBudgetCategoryUseCase = container.get(
  "createBudgetCategoryUseCase",
  () =>
    new CreateBudgetCategoryUseCase(budgetCategoryRepository, teamRepository)
);
export const updateBudgetCategoryUseCase = container.get(
  "updateBudgetCategoryUseCase",
  () =>
    new UpdateBudgetCategoryUseCase(budgetCategoryRepository, teamRepository)
);
export const deleteBudgetCategoryUseCase = container.get(
  "deleteBudgetCategoryUseCase",
  () =>
    new DeleteBudgetCategoryUseCase(budgetCategoryRepository, teamRepository)
);

// Investments
export const getInvestmentsUseCase = container.get(
  "getInvestmentsUseCase",
  () => new GetInvestmentsUseCase(investmentRepository)
);
export const createInvestmentUseCase = container.get(
  "createInvestmentUseCase",
  () => new CreateInvestmentUseCase(investmentRepository, teamRepository)
);
export const updateInvestmentUseCase = container.get(
  "updateInvestmentUseCase",
  () => new UpdateInvestmentUseCase(investmentRepository, teamRepository)
);
export const deleteInvestmentUseCase = container.get(
  "deleteInvestmentUseCase",
  () => new DeleteInvestmentUseCase(investmentRepository, teamRepository)
);
export const simulateInvestmentGrowthUseCase = container.get(
  "simulateInvestmentGrowthUseCase",
  () => new SimulateInvestmentGrowthUseCase()
);

// Team Management
export const getTeamDataUseCase = container.get(
  "getTeamDataUseCase",
  () => new GetTeamDataUseCase(teamRepository, subscriptionRepository)
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
  () => new ParseReceiptUseCase(aiService, new ClientAnalyticsService())
);

// Team Invites (Onboarding)

export const getPendingInvitesUseCase = container.get(
  "getPendingInvitesUseCase",
  () => new GetPendingInvitesUseCase(teamRepository)
);

export const acceptInviteUseCase = container.get(
  "acceptInviteUseCase",
  () => new AcceptInviteUseCase(teamRepository)
);

export const declineInviteUseCase = container.get(
  "declineInviteUseCase",
  () => new DeclineInviteUseCase(teamRepository)
);

// Subscription & Billing
export const checkFeatureAccessUseCase = container.get(
  "checkFeatureAccessUseCase",
  () =>
    new CheckFeatureAccessUseCase(
      teamRepository,
      subscriptionRepository,
      new ClientAnalyticsService()
    )
);
