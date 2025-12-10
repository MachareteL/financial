import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { SupabaseSubscriptionRepository } from "@/infrastructure/repositories/supabase-subscription.repository";
import { Subscription } from "@/domain/entities/subscription";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover" as unknown as Stripe.LatestApiVersion,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Fix for missing types in Stripe SDK v20.0.0
type StripeSubscription = Stripe.Subscription & {
  current_period_end: number;
};

// Helper to get Team ID from subscription or checkout session
async function getTeamIdFromEvent(
  event: Stripe.Event,
  subscription: Stripe.Subscription,
  repository: SupabaseSubscriptionRepository
): Promise<string | null> {
  // 1. Try metadata on subscription
  if (subscription.metadata?.team_id) {
    return subscription.metadata.team_id;
  }

  // 2. Try looking up by client_reference_id on the latest invoice/checkout session if possible
  // This is hard to do from just the subscription object without extra API calls,
  // but we can try to find an existing subscription by external ID in our DB?
  const existing = await repository.findByExternalId(subscription.id);
  if (existing) {
    return existing.teamId;
  }

  return null;
}

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
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    );
  }

  try {
    console.log(event);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // Here we can log success or trigger immediate provisions if needed.
        // Usually subscription.created handles the logic, but this confirms payment.
        if (session.mode === "subscription" && session.client_reference_id) {
          console.log(
            `Checkout completed for team ${session.client_reference_id}`
          );
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.paused":
      case "customer.subscription.resumed":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;

        // Fix for missing types in Stripe SDK v20.0.0
        const typedSub = sub as unknown as StripeSubscription;

        let teamId = sub.metadata?.team_id;

        if (!teamId) {
          console.warn(
            `Missing team_id in metadata for subscription ${sub.id}. Attempting recovery...`
          );
          const recoveredTeamId = await getTeamIdFromEvent(
            event,
            sub,
            subscriptionRepository
          );

          if (recoveredTeamId) {
            teamId = recoveredTeamId;
          } else {
            console.error(
              `FAILED to recover team_id for subscription ${sub.id}. Ignoring event.`
            );
            break;
          }
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
          cancelAtPeriodEnd:
            typedSub.cancel_at_period_end || !!typedSub.cancel_at,
          createdAt: existingSub ? existingSub.createdAt : new Date(),
          updatedAt: new Date(),
        });

        if (existingSub) {
          await subscriptionRepository.update(subscriptionData);
        } else {
          await subscriptionRepository.create(subscriptionData);
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
        break;
    }
  } catch (error: unknown) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
