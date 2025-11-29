import { Container } from "./container";
import { StripePaymentGateway } from "@/infrastructure/services/stripe-payment.gateway";
import { ServerSupabaseSubscriptionRepository } from "../repositories/server-supabase-subscription.repository";
import { GetSubscriptionStatusUseCase } from "@/app/(app)/team/_use-case/get-subscription-status.use-case";
import { SubscribeTeamUseCase } from "@/app/(app)/team/_use-case/subscribe-team.use-case";
import { ManageSubscriptionUseCase } from "@/app/(app)/team/_use-case/manage-subscription.use-case";

const container = Container.getInstance();

const paymentGateway = container.get(
  "paymentGateway",
  () => new StripePaymentGateway()
);

const subscriptionRepository = container.get(
  "subscriptionRepository",
  () => new ServerSupabaseSubscriptionRepository()
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
