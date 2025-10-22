import { AuthRepository } from "@/infrastructure/repositories/auth.repository"
import { UserRepository } from "@/infrastructure/repositories/user.repository"
import { ExpenseRepository } from "@/infrastructure/repositories/expense.repository"
import { CategoryRepository } from "@/infrastructure/repositories/category.repository"
import { BudgetRepository } from "@/infrastructure/repositories/budget.repository"
import { InvestmentRepository } from "@/infrastructure/repositories/investment.repository"
import { FamilyRepository } from "@/infrastructure/repositories/family.repository"
import { SupabaseIncomeRepository } from "@/infrastructure/repositories/supabase-income.repository"
import { SupabaseBudgetRepository } from "@/infrastructure/repositories/supabase-budget.repository"

import { SignUpUseCase } from "../app/auth/_use-case/sign-up.use-case"
import { SignInUseCase } from "../app/auth/_use-case/sign-in.use-case"
import { SignOutUseCase } from "../app/auth/_use-case/sign-out.use-case"
import { GetCurrentUserUseCase } from "../app/auth/_use-case/get-current-user.use-case"
import { CreateFamilyUseCase } from "../app/family/use-case/create-family.use-case"
import { CreateExpenseUseCase } from "../app/expenses/use-case/create-expense.use-case"
import { GetExpensesUseCase } from "../app/expenses/use-case/get-expenses.use-case"
import { UpdateExpenseUseCase } from "../app/expenses/use-case/update-expense.use-case"
import { DeleteExpenseUseCase } from "../app/expenses/use-case/delete-expense.use-case"
import { GetCategoriesUseCase } from "../app/categories/_use-case/get-categories.use-case"
import { CreateCategoryUseCase } from "../app/categories/_use-case/create-category.use-case"
import { UpdateCategoryUseCase } from "../app/categories/_use-case/update-category.use-case"
import { DeleteCategoryUseCase } from "../app/categories/_use-case/delete-category.use-case"
import { GetBudgetSummaryUseCase } from "../app/budget/_use-case/get-budget-summary.use-case"
import { CreateOrUpdateBudgetUseCase } from "../app/budget/_use-case/create-or-update-budget.use-case"
import { ManageIncomeUseCase } from "../app/budget/_use-case/manage-income.use-case"
import { ManageInvestmentsUseCase } from "../app/investments/use-case/manage-investments.use-case"
import { GetIncomesUseCase } from "../app/budget/_use-case/get-incomes.use-case"
import { CreateIncomeUseCase } from "../app/budget/_use-case/create-income.use-case"
import { UpdateIncomeUseCase } from "../app/budget/_use-case/update-income.use-case"
import { DeleteIncomeUseCase } from "../app/budget/_use-case/delete-income.use-case"
import { GetBudgetUseCase } from "../app/budget/_use-case/get-budget.use-case"
import { SaveBudgetUseCase } from "../app/budget/_use-case/save-budget.use-case"
import { GetMonthlyExpensesUseCase } from "../app/budget/_use-case/get-monthly-expenses.use-case"
import { GetDashboardDataUseCase } from "../app/dashboard/_use-case/get-dashboard-data.use-case"

// Repositories (Singleton instances)
const authRepository = new AuthRepository()
const userRepository = new UserRepository()
const expenseRepository = new ExpenseRepository()
const categoryRepository = new CategoryRepository()
const budgetRepository = new BudgetRepository()
const investmentRepository = new InvestmentRepository()
const familyRepository = new FamilyRepository()
const incomeRepository = new SupabaseIncomeRepository()
const supabaseBudgetRepository = new SupabaseBudgetRepository()

// Use Cases
export const signUpUseCase = new SignUpUseCase(authRepository, userRepository)
export const signInUseCase = new SignInUseCase(authRepository)
export const signOutUseCase = new SignOutUseCase(authRepository)
export const getCurrentUserUseCase = new GetCurrentUserUseCase(userRepository)
export const createFamilyUseCase = new CreateFamilyUseCase(userRepository, categoryRepository)

export const createExpenseUseCase = new CreateExpenseUseCase(expenseRepository)
export const getExpensesUseCase = new GetExpensesUseCase(expenseRepository)
export const updateExpenseUseCase = new UpdateExpenseUseCase(expenseRepository)
export const deleteExpenseUseCase = new DeleteExpenseUseCase(expenseRepository)

export const getCategoriesUseCase = new GetCategoriesUseCase(categoryRepository)
export const createCategoryUseCase = new CreateCategoryUseCase(categoryRepository)
export const updateCategoryUseCase = new UpdateCategoryUseCase(categoryRepository)
export const deleteCategoryUseCase = new DeleteCategoryUseCase(categoryRepository)

export const getBudgetSummaryUseCase = new GetBudgetSummaryUseCase(budgetRepository)
export const createOrUpdateBudgetUseCase = new CreateOrUpdateBudgetUseCase(budgetRepository)
export const manageIncomeUseCase = new ManageIncomeUseCase(budgetRepository)

export const manageInvestmentsUseCase = new ManageInvestmentsUseCase(investmentRepository)

export const getIncomesUseCase = new GetIncomesUseCase(incomeRepository)
export const createIncomeUseCase = new CreateIncomeUseCase(incomeRepository)
export const updateIncomeUseCase = new UpdateIncomeUseCase(incomeRepository)
export const deleteIncomeUseCase = new DeleteIncomeUseCase(incomeRepository)
export const getBudgetUseCase = new GetBudgetUseCase(supabaseBudgetRepository)
export const saveBudgetUseCase = new SaveBudgetUseCase(supabaseBudgetRepository)
export const getMonthlyExpensesUseCase = new GetMonthlyExpensesUseCase(expenseRepository)
export const getDashboardDataUseCase = new GetDashboardDataUseCase(expenseRepository, incomeRepository)

// Export repositories for direct access when needed
export {
  authRepository,
  userRepository,
  expenseRepository,
  categoryRepository,
  budgetRepository,
  investmentRepository,
  familyRepository,
  incomeRepository,
  supabaseBudgetRepository,
}
