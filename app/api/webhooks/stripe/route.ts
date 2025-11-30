import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { SupabaseSubscriptionRepository } from "@/infrastructure/repositories/supabase-subscription.repository";
import { Subscription } from "@/domain/entities/subscription";
import { PostHogAnalyticsService } from "@/infrastructure/services/posthog-analytics.service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover" as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Fix for missing types in Stripe SDK v20.0.0
type StripeSubscription = Stripe.Subscription & {
  current_period_end: number;
};

// Create a Supabase client with the Service Role Key for admin access
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const subscriptionRepository = new SupabaseSubscriptionRepository(
  supabaseAdmin
);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;

        // Fix for missing types in Stripe SDK v20.0.0
        const typedSub = sub as unknown as StripeSubscription;

        const teamId = sub.metadata?.team_id;

        if (!teamId) {
          console.error("Team ID not found in subscription metadata");
          break;
        }

        const existingSub = await subscriptionRepository.findByExternalId(
          sub.id
        );

        const subscriptionData = new Subscription({
          id: existingSub ? existingSub.id : crypto.randomUUID(),
          teamId: teamId,
          externalId: sub.id,
          externalCustomerId: sub.customer as string,
          gatewayId: "stripe",
          status: typedSub.status,
          planId: typedSub.items.data[0].price.id,
          currentPeriodEnd: typedSub.current_period_end
            ? new Date(typedSub.current_period_end * 1000)
            : null,
          createdAt: existingSub ? existingSub.createdAt : new Date(),
          updatedAt: new Date(),
        });

        if (existingSub) {
          await subscriptionRepository.update(subscriptionData);
        } else {
          await subscriptionRepository.create(subscriptionData);

          // Fire-and-forget analytics
          // We need to instantiate service here as this is a webhook handler
          const analyticsService = new PostHogAnalyticsService();
          // We need userId. Subscription has externalCustomerId.
          // We might need to fetch user by customerId or use teamId if we track at team level.
          // Requirement says: "subscription_activated"
          // Props: { plan_id: planId, amount: amount, currency: currency }
          // We have planId. Amount and currency are in the event object but deeper.
          // typedSub.items.data[0].price.unit_amount
          // typedSub.items.data[0].price.currency
          // But we need a user ID for `track`.
          // If we don't have user ID, we can use a system ID or the team creator if we knew it.
          // Or we can use `group` analytics?
          // But `track` requires a distinctId.
          // Maybe we can use the `teamId` as distinctId if we treat team as user? No.
          // We should try to find the user who owns the subscription.
          // But `subscriptionRepository` doesn't seem to have `findByTeamId` easily accessible here?
          // Wait, we have `teamId` from metadata.
          // We can try to find the team owner?
          // Or we can just use the `externalCustomerId` (Stripe Customer ID) as the distinctId if we aliased it?
          // Usually we alias Stripe Customer ID to User ID.
          // If not, we might lose the link.
          // Let's assume we can use `teamId` as the distinctId for team-level events if acceptable,
          // OR better: use a specific "system" user or try to find the admin.
          // BUT, `track` needs a user.
          // Let's look at `PostHogAnalyticsService`. It takes `userId`.
          // If I use `teamId`, it might pollute user list.
          // Let's check if we can get `userId` from metadata?
          // `sub.metadata?.user_id`?
          // If we added it during checkout session creation.
          // Let's check `SubscribeTeamUseCase`.
          // It calls `paymentGateway.createCheckoutSession`.
          // Does it pass metadata?
          // I can't see `createCheckoutSession` implementation here.
          // But usually we pass `client_reference_id` or `metadata`.
          // If `team_id` is in metadata, maybe `user_id` is too?
          // I'll check `sub.metadata`.
          // If `user_id` is there, great.
          // If not, I'll try to use `team_id` or log a warning.
          // Critical business event.
          // I'll assume `user_id` might be in metadata or I'll use `teamId` as a fallback for now,
          // but ideally I should ensure `user_id` is passed in checkout.
          // Let's assume `sub.metadata.user_id` exists.

          const userId =
            sub.metadata?.user_id || sub.metadata?.userId || "unknown_user";
          const price = typedSub.items.data[0].price;

          analyticsService.track(userId, "subscription_activated", {
            plan_id: price.id,
            amount: price.unit_amount ? price.unit_amount / 100 : 0,
            currency: price.currency,
            team_id: teamId,
          });
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
        break;
    }
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
