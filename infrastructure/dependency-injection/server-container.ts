import { Container } from "./container";
import { StripePaymentGateway } from "@/infrastructure/services/stripe-payment.gateway";
import { ServerSupabaseSubscriptionRepository } from "../repositories/server-supabase-subscription.repository";
import { GetSubscriptionStatusUseCase } from "@/app/(app)/team/_use-case/get-subscription-status.use-case";
import { SubscribeTeamUseCase } from "@/app/(app)/team/_use-case/subscribe-team.use-case";
import { ManageSubscriptionUseCase } from "@/app/(app)/team/_use-case/manage-subscription.use-case";
import { CheckFeatureAccessUseCase } from "@/app/(app)/team/_use-case/check-feature-access.use-case";
import { VerifyTeamPermissionUseCase } from "@/app/(app)/team/_use-case/verify-team-permission.use-case";
import { ServerSupabaseTeamRepository } from "../repositories/server-supabase-team.repository";
import { GeminiAiService } from "@/infrastructure/services/gemini-ai.service";
import { ParseReceiptUseCase } from "@/app/(app)/expenses/_use-case/parse-receipt.use-case";
import { RateLimitService } from "@/infrastructure/services/rate-limit.service";

const container = Container.getInstance();

const paymentGateway = container.get(
  "paymentGateway",
  () => new StripePaymentGateway()
);

const subscriptionRepository = container.get(
  "subscriptionRepository",
  () => new ServerSupabaseSubscriptionRepository()
);

const teamRepository = container.get(
  "teamRepository",
  () => new ServerSupabaseTeamRepository()
);

import { ServerSupabaseCategoryRepository } from "../repositories/server-supabase-category.repository";
import { ServerSupabaseBudgetCategoryRepository } from "../repositories/server-supabase-budget-category.repository";
import { CreateTeamUseCase } from "@/app/(app)/team/_use-case/create-team.use-case";

const categoryRepository = new ServerSupabaseCategoryRepository();
const budgetCategoryRepository = new ServerSupabaseBudgetCategoryRepository();

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

export const subscribeTeamUseCase = container.get(
  "subscribeTeamUseCase",
  () => new SubscribeTeamUseCase(paymentGateway)
);

export const manageSubscriptionUseCase = container.get(
  "manageSubscriptionUseCase",
  () => new ManageSubscriptionUseCase(paymentGateway, subscriptionRepository)
);

export const getSubscriptionStatusUseCase = container.get(
  "getSubscriptionStatusUseCase",
  () => new GetSubscriptionStatusUseCase(subscriptionRepository)
);

export const checkFeatureAccessUseCase = container.get(
  "checkFeatureAccessUseCase",
  () => new CheckFeatureAccessUseCase(teamRepository, subscriptionRepository)
);

export const verifyTeamPermissionUseCase = container.get(
  "verifyTeamPermissionUseCase",
  () => new VerifyTeamPermissionUseCase(teamRepository)
);

const aiService = container.get(
  "aiService",
  () =>
    new GeminiAiService(
      process.env.GOOGLE_API_KEY!,
      process.env.GOOGLE_GEMINI_MODEL
    )
);

export const parseReceiptUseCase = container.get(
  "parseReceiptUseCase",
  () => new ParseReceiptUseCase(aiService)
);

export const rateLimitService = container.get(
  "rateLimitService",
  () => new RateLimitService()
);
