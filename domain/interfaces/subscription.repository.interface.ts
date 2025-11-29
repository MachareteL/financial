import { Subscription } from "../entities/subscription";

export interface ISubscriptionRepository {
  create(subscription: Subscription): Promise<void>;
  update(subscription: Subscription): Promise<void>;
  findByTeamId(teamId: string): Promise<Subscription | null>;
  findByExternalId(externalId: string): Promise<Subscription | null>;
}
