export interface SubscriptionDTO {
  id: string;
  teamId: string;
  externalId: string;
  externalCustomerId: string;
  gatewayId: string;
  status: string;
  planId: string | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}
