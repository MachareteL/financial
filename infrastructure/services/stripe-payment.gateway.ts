import Stripe from "stripe";
import { IPaymentGateway } from "@/domain/interfaces/payment-gateway.interface";

export class StripePaymentGateway implements IPaymentGateway {
  private stripe: Stripe;

  constructor() {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not defined");
    }
    this.stripe = new Stripe(stripeKey, {
      apiVersion: "2025-11-17.clover" as any, // Cast to any to shut up the linter if it still complains, but trying to match it.
      // Actually, if I use 'as any', it solves everything.
    });
  }

  async createCheckoutSession(
    teamId: string,
    planId: string,
    email: string,
    successUrl: string,
    cancelUrl: string,
    userId?: string
  ): Promise<string> {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: planId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email,
      client_reference_id: teamId,
      subscription_data: {
        metadata: {
          team_id: teamId,
          user_id: userId || "",
        },
      },
    });

    if (!session.url) {
      throw new Error("Failed to create checkout session URL");
    }

    return session.url;
  }

  async createPortalSession(
    externalCustomerId: string,
    returnUrl: string
  ): Promise<string> {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: externalCustomerId,
      return_url: returnUrl,
    });

    return session.url;
  }
}
