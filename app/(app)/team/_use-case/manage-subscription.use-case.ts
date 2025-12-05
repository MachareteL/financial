import { IPaymentGateway } from "@/domain/interfaces/payment-gateway.interface";
import { ISubscriptionRepository } from "@/domain/interfaces/subscription.repository.interface";

export class ManageSubscriptionUseCase {
  constructor(
    private paymentGateway: IPaymentGateway,
    private subscriptionRepository: ISubscriptionRepository
  ) {}

  async execute(teamId: string, returnUrl: string): Promise<string> {
    const subscription = await this.subscriptionRepository.findByTeamId(teamId);

    if (!subscription) {
      throw new Error("Assinatura não encontrada para este time.");
    }

    const portalUrl = await this.paymentGateway.createPortalSession(
      subscription.externalCustomerId,
      returnUrl
    );

    return portalUrl;
  }
}
