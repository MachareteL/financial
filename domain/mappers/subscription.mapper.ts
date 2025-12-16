import { DateUtils } from "@/domain/utils/date.utils";
import { Subscription } from "../entities/subscription";
import type { SubscriptionDTO } from "../dto/subscription.types.d.ts";
import { Mapper } from "../interfaces/mapper.interface";

export class SubscriptionMapperImplementation implements Mapper<
  Subscription,
  SubscriptionDTO
> {
  toDomain(raw: any): Subscription {
    return new Subscription({
      id: raw.id,
      teamId: raw.teamId,
      externalId: raw.externalId,
      externalCustomerId: raw.externalCustomerId,
      gatewayId: raw.gatewayId,
      status: raw.status as any, // Enum cast might be needed validation
      planId: raw.planId,
      currentPeriodEnd: DateUtils.parse(raw.currentPeriodEnd),
      cancelAtPeriodEnd: raw.cancelAtPeriodEnd,
      createdAt: DateUtils.parse(raw.createdAt) || DateUtils.now(),
      updatedAt: DateUtils.parse(raw.updatedAt) || DateUtils.now(),
    });
  }

  toDTO(s: Subscription): SubscriptionDTO {
    return {
      id: s.id,
      teamId: s.teamId,
      externalId: s.externalId,
      externalCustomerId: s.externalCustomerId,
      gatewayId: s.gatewayId,
      status: s.status,
      planId: s.planId,
      currentPeriodEnd: s.currentPeriodEnd,
      cancelAtPeriodEnd: s.cancelAtPeriodEnd,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  }
}

export const SubscriptionMapper = new SubscriptionMapperImplementation();
