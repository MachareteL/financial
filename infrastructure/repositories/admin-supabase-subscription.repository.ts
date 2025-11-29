import { ISubscriptionRepository } from "@/domain/interfaces/subscription.repository.interface";
import { Subscription } from "@/domain/entities/subscription";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/domain/dto/database.types.d.ts";

export class AdminSupabaseSubscriptionRepository
  implements ISubscriptionRepository
{
  private supabase;

  constructor() {
    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async create(subscription: Subscription): Promise<void> {
    const { error } = await this.supabase.from("subscriptions").insert({
      id: subscription.id,
      team_id: subscription.teamId,
      external_id: subscription.externalId,
      external_customer_id: subscription.externalCustomerId,
      gateway_id: subscription.gatewayId,
      status: subscription.status,
      plan_id: subscription.planId,
      current_period_end: subscription.currentPeriodEnd
        ? subscription.currentPeriodEnd.toISOString()
        : null,
      created_at: subscription.createdAt.toISOString(),
      updated_at: subscription.updatedAt.toISOString(),
    });

    if (error) throw new Error(error.message);
  }

  async update(subscription: Subscription): Promise<void> {
    const { error } = await this.supabase
      .from("subscriptions")
      .update({
        status: subscription.status,
        plan_id: subscription.planId,
        current_period_end: subscription.currentPeriodEnd
          ? subscription.currentPeriodEnd.toISOString()
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscription.id);

    if (error) throw new Error(error.message);
  }

  async findByTeamId(teamId: string): Promise<Subscription | null> {
    const { data, error } = await this.supabase
      .from("subscriptions")
      .select("*")
      .eq("team_id", teamId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    return this.mapToEntity(data);
  }

  async findByExternalId(externalId: string): Promise<Subscription | null> {
    const { data, error } = await this.supabase
      .from("subscriptions")
      .select("*")
      .eq("external_id", externalId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    return this.mapToEntity(data);
  }

  private mapToEntity(data: any): Subscription {
    return new Subscription({
      id: data.id,
      teamId: data.team_id,
      externalId: data.external_id,
      externalCustomerId: data.external_customer_id,
      gatewayId: data.gateway_id,
      status: data.status as any,
      planId: data.plan_id,
      currentPeriodEnd: data.current_period_end
        ? new Date(data.current_period_end)
        : null,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    });
  }
}
