import { ISubscriptionRepository } from "@/domain/interfaces/subscription.repository.interface";
import { Subscription } from "@/domain/entities/subscription";

export class GetSubscriptionStatusUseCase {
  constructor(private subscriptionRepository: ISubscriptionRepository) {}

  async execute(teamId: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findByTeamId(teamId);
  }
}
