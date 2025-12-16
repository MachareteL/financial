import { Container } from "./container";
import { StripePaymentGateway } from "@/infrastructure/services/stripe-payment.gateway";
import { SupabaseSubscriptionRepository } from "../repositories/supabase-subscription.repository";
import { TeamRepository } from "../repositories/supabase-team.repository";
import { CategoryRepository } from "../repositories/supabase-category.repository";
import { BudgetCategoryRepository } from "../repositories/supabase-budget-category.repository";
import { PostHogAnalyticsService } from "@/infrastructure/services/posthog-analytics.service";
import { GeminiAiService } from "@/infrastructure/services/gemini-ai.service";
import { SubscribeTeamUseCase } from "@/app/(app)/team/_use-case/subscribe-team.use-case";
import { ManageSubscriptionUseCase } from "@/app/(app)/team/_use-case/manage-subscription.use-case";
import { GetSubscriptionStatusUseCase } from "@/app/(app)/team/_use-case/get-subscription-status.use-case";
import { CheckFeatureAccessUseCase } from "@/app/(app)/team/_use-case/check-feature-access.use-case";
import { VerifyTeamPermissionUseCase } from "@/app/(app)/team/_use-case/verify-team-permission.use-case";
import { CreateTeamUseCase } from "@/app/(app)/team/_use-case/create-team.use-case";
import { ParseReceiptUseCase } from "@/app/(app)/expenses/_use-case/parse-receipt.use-case";
import { RateLimitService } from "@/infrastructure/services/rate-limit.service";
import { getSupabaseClient } from "../database/supabase.server";
import { ExpenseRepository } from "../repositories/supabase-expense.repository";
import { ExportExpensesUseCase } from "@/app/(app)/expenses/_use-case/export-expenses.use-case";
import { ExcelExporterService } from "@/infrastructure/services/excel-exporter.service";
import { SupabaseInsightRepository } from "../repositories/supabase-insight.repository";
import { GetPendingInsightsUseCase } from "@/app/(app)/dashboard/_use-case/get-pending-insights.use-case";
import { MarkInsightAsReadUseCase } from "@/app/(app)/dashboard/_use-case/mark-insight-as-read.use-case";
import { GenerateWeeklyReportUseCase } from "@/app/(app)/dashboard/_use-case/generate-weekly-report.use-case";
import { GenerateBatchWeeklyReportsUseCase } from "@/app/(app)/dashboard/_use-case/generate-batch-weekly-reports.use-case";

const container = Container.getInstance();

export const getAnalyticsService = () => {
  return container.get(
    "analyticsService",
    () =>
      new PostHogAnalyticsService(
        process.env.NEXT_PUBLIC_POSTHOG_KEY!,
        process.env.NEXT_PUBLIC_POSTHOG_HOST
      )
  );
};

export const getPaymentGateway = () => {
  return container.get("paymentGateway", () => new StripePaymentGateway());
};

export const getSubscriptionRepository = async () => {
  const supabase = await getSupabaseClient();
  return container.get(
    "subscriptionRepository",
    () => new SupabaseSubscriptionRepository(supabase)
  );
};

export const getTeamRepository = async () => {
  const supabase = await getSupabaseClient();
  return container.get("teamRepository", () => new TeamRepository(supabase));
};

export const getCategoryRepository = async () => {
  const supabase = await getSupabaseClient();
  return container.get(
    "categoryRepository",
    () => new CategoryRepository(supabase)
  );
};

export const getBudgetCategoryRepository = async () => {
  const supabase = await getSupabaseClient();
  return container.get(
    "budgetCategoryRepository",
    () => new BudgetCategoryRepository(supabase)
  );
};

export const getCreateTeamUseCase = async () => {
  const teamRepo = await getTeamRepository();
  const categoryRepo = await getCategoryRepository();
  const budgetCategoryRepo = await getBudgetCategoryRepository();
  const subscriptionRepo = await getSubscriptionRepository();

  return container.get(
    "createTeamUseCase",
    () =>
      new CreateTeamUseCase(
        teamRepo,
        categoryRepo,
        budgetCategoryRepo,
        subscriptionRepo
      )
  );
};

export const getSubscribeTeamUseCase = () => {
  return container.get(
    "subscribeTeamUseCase",
    () => new SubscribeTeamUseCase(getPaymentGateway(), getAnalyticsService())
  );
};

export const getManageSubscriptionUseCase = async () => {
  const subscriptionRepo = await getSubscriptionRepository();
  return container.get(
    "manageSubscriptionUseCase",
    () => new ManageSubscriptionUseCase(getPaymentGateway(), subscriptionRepo)
  );
};

export const getGetSubscriptionStatusUseCase = async () => {
  const subscriptionRepo = await getSubscriptionRepository();
  return container.get(
    "getSubscriptionStatusUseCase",
    () => new GetSubscriptionStatusUseCase(subscriptionRepo)
  );
};

export const getCheckFeatureAccessUseCase = async () => {
  const teamRepo = await getTeamRepository();
  const subscriptionRepo = await getSubscriptionRepository();
  return container.get(
    "checkFeatureAccessUseCase",
    () =>
      new CheckFeatureAccessUseCase(
        teamRepo,
        subscriptionRepo,
        getAnalyticsService()
      )
  );
};

export const getVerifyTeamPermissionUseCase = async () => {
  const teamRepo = await getTeamRepository();
  return container.get(
    "verifyTeamPermissionUseCase",
    () => new VerifyTeamPermissionUseCase(teamRepo)
  );
};

const getAiService = () => {
  return container.get(
    "aiService",
    () =>
      new GeminiAiService(
        process.env.GOOGLE_API_KEY!,
        process.env.GOOGLE_GEMINI_MODEL
      )
  );
};

export const getParseReceiptUseCase = () => {
  return container.get(
    "parseReceiptUseCase",
    () => new ParseReceiptUseCase(getAiService(), getAnalyticsService())
  );
};

export const getRateLimitService = () => {
  return container.get("rateLimitService", () => new RateLimitService());
};

export const getExpenseRepository = async () => {
  const supabase = await getSupabaseClient();
  return container.get(
    "expenseRepository",
    () => new ExpenseRepository(supabase)
  );
};

export const getExportExpensesUseCase = async () => {
  const expenseRepo = await getExpenseRepository();
  const subRepo = await getSubscriptionRepository();
  const teamRepo = await getTeamRepository();
  const excelService = new ExcelExporterService();

  return container.get(
    "exportExpensesUseCase",
    () =>
      new ExportExpensesUseCase(expenseRepo, subRepo, teamRepo, excelService)
  );
};
// Insights

export const getInsightRepository = async () => {
  const supabase = await getSupabaseClient();
  return container.get(
    "insightRepository",
    () => new SupabaseInsightRepository(supabase)
  );
};

export const getGetPendingInsightsUseCase = async () => {
  const insightRepo = await getInsightRepository();
  return container.get(
    "getPendingInsightsUseCase",
    () => new GetPendingInsightsUseCase(insightRepo)
  );
};

export const getMarkInsightAsReadUseCase = async () => {
  const insightRepo = await getInsightRepository();
  return container.get(
    "markInsightAsReadUseCase",
    () => new MarkInsightAsReadUseCase(insightRepo)
  );
};

export const getGenerateWeeklyReportUseCase = async () => {
  const expenseRepo = await getExpenseRepository();
  const insightRepo = await getInsightRepository();
  const aiService = getAiService();

  return container.get(
    "generateWeeklyReportUseCase",
    () => new GenerateWeeklyReportUseCase(expenseRepo, aiService, insightRepo)
  );
};

export const getGenerateBatchWeeklyReportsUseCase = async () => {
  const teamRepo = await getTeamRepository();
  const generateWeeklyReportUseCase = await getGenerateWeeklyReportUseCase();

  return container.get(
    "generateBatchWeeklyReportsUseCase",
    () =>
      new GenerateBatchWeeklyReportsUseCase(
        teamRepo,
        generateWeeklyReportUseCase
      )
  );
};
