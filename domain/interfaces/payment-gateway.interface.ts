export interface IPaymentGateway {
  /**
   * Creates a checkout session for a subscription.
   * @param teamId The internal team ID
   * @param planId The external plan ID (e.g. price_...)
   * @param email The customer email
   * @param successUrl URL to redirect on success
   * @param cancelUrl URL to redirect on cancel
   * @returns The checkout URL
   */
  createCheckoutSession(
    teamId: string,
    planId: string,
    email: string,
    successUrl: string,
    cancelUrl: string,
    userId?: string
  ): Promise<string>;

  /**
   * Creates a portal session for managing subscriptions.
   * @param externalCustomerId The external customer ID (e.g. cus_...)
   * @param returnUrl URL to redirect after managing
   * @returns The portal URL
   */
  createPortalSession(
    externalCustomerId: string,
    returnUrl: string
  ): Promise<string>;
}
