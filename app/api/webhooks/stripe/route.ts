import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { SupabaseSubscriptionRepository } from "@/infrastructure/repositories/supabase-subscription.repository";
import { Subscription } from "@/domain/entities/subscription";

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
    console.log(event);

    switch (event.type) {
      case "checkout.session.completed": {
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
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
