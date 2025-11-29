import { z } from "zod";

export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid(),
  externalId: z.string(),
  externalCustomerId: z.string(),
  gatewayId: z.string(),
  status: z.enum([
    "active",
    "past_due",
    "canceled",
    "trialing",
    "incomplete",
    "incomplete_expired",
    "unpaid",
    "paused",
  ]),
  planId: z.string().nullable(),
  currentPeriodEnd: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SubscriptionProps = z.infer<typeof SubscriptionSchema>;

export class Subscription {
  private props: SubscriptionProps;

  constructor(props: SubscriptionProps) {
    SubscriptionSchema.parse(props);
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }
  get teamId(): string {
    return this.props.teamId;
  }
  get externalId(): string {
    return this.props.externalId;
  }
  get externalCustomerId(): string {
    return this.props.externalCustomerId;
  }
  get gatewayId(): string {
    return this.props.gatewayId;
  }
  get status(): string {
    return this.props.status;
  }
  get planId(): string | null {
    return this.props.planId;
  }
  get currentPeriodEnd(): Date | null {
    return this.props.currentPeriodEnd;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isActive(): boolean {
    return ["active", "trialing"].includes(this.props.status);
  }
}
