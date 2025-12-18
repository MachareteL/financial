import Stripe from "stripe";
import { IPaymentGateway } from "@/domain/interfaces/payment-gateway.interface";
import { env } from "@/lib/env";

export class StripePaymentGateway implements IPaymentGateway {
  private stripe: Stripe;

  constructor() {
    if (typeof window !== "undefined") {
      throw new Error(
        "StripePaymentGateway can only be initialized on the server"
      );
    }

    const stripeKey = env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw new Error(
        "STRIPE_SECRET_KEY is not configured. Payment features are disabled."
      );
    }

    this.stripe = new Stripe(stripeKey, {
      apiVersion: "2025-11-17.clover" as Stripe.LatestApiVersion,
    });
  }

  async createCheckoutSession(
    teamId: string,
    planId: string,
    email: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    try {
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
          },
        },
      });

      if (!session.url) {
        throw new Error("Failed to create checkout session URL");
      }

      return session.url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      throw new Error("Failed to initialize payment session");
    }
  }

  async createPortalSession(
    externalCustomerId: string,
    returnUrl: string
  ): Promise<string> {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: externalCustomerId,
        return_url: returnUrl,
      });

      return session.url;
    } catch (error) {
      console.error("Error creating portal session:", error);
      throw new Error("Failed to access subscription portal");
    }
  }
}
