import { AuthRepository } from "@/infrastructure/repositories/auth.repository"
import { UserRepository } from "@/infrastructure/repositories/user.repository"
import { ExpenseRepository } from "@/infrastructure/repositories/expense.repository"
import { CategoryRepository } from "@/infrastructure/repositories/category.repository"
import { BudgetRepository } from "@/infrastructure/repositories/budget.repository"
import { InvestmentRepository } from "@/infrastructure/repositories/investment.repository"
import { FamilyRepository } from "@/infrastructure/repositories/family.repository"
import { SupabaseIncomeRepository } from "@/infrastructure/repositories/supabase-income.repository"
import { SupabaseBudgetRepository } from "@/infrastructure/repositories/supabase-budget.repository"

import { SignUpUseCase } from "../use-cases/auth/sign-up.use-case"
import { SignInUseCase } from "../use-cases/auth/sign-in.use-case"
import { SignOutUseCase } from "../use-cases/auth/sign-out.use-case"
import { GetCurrentUserUseCase } from "../use-cases/auth/get-current-user.use-case"
import { CreateFamilyUseCase } from "../use-cases/family/create-family.use-case"
import { CreateExpenseUseCase } from "../use-cases/expenses/create-expense.use-case"
import { GetExpensesUseCase } from "../use-cases/expenses/get-expenses.use-case"
import { UpdateExpenseUseCase } from "../use-cases/expenses/update-expense.use-case"
import { DeleteExpenseUseCase } from "../use-cases/expenses/delete-expense.use-case"
import { GetCategoriesUseCase } from "../use-cases/categories/get-categories.use-case"
import { CreateCategoryUseCase } from "../use-cases/categories/create-category.use-case"
import { UpdateCategoryUseCase } from "../use-cases/categories/update-category.use-case"
import { DeleteCategoryUseCase } from "../use-cases/categories/delete-category.use-case"
import { GetBudgetSummaryUseCase } from "../use-cases/budget/get-budget-summary.use-case"
import { CreateOrUpdateBudgetUseCase } from "../use-cases/budget/create-or-update-budget.use-case"
import { ManageIncomeUseCase } from "../use-cases/budget/manage-income.use-case"
import { ManageInvestmentsUseCase } from "../use-cases/investments/manage-investments.use-case"
import { GetIncomesUseCase } from "../use-cases/budget/get-incomes.use-case"
import { CreateIncomeUseCase } from "../use-cases/budget/create-income.use-case"
import { UpdateIncomeUseCase } from "../use-cases/budget/update-income.use-case"
import { DeleteIncomeUseCase } from "../use-cases/budget/delete-income.use-case"
import { GetBudgetUseCase } from "../use-cases/budget/get-budget.use-case"
import { SaveBudgetUseCase } from "../use-cases/budget/save-budget.use-case"
import { GetMonthlyExpensesUseCase } from "../use-cases/budget/get-monthly-expenses.use-case"
import { GetDashboardDataUseCase } from "../use-cases/dashboard/get-dashboard-data.use-case"

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
