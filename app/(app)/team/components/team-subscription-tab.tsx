"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { TeamBillingSection } from "./team-billing-section";
import type { SubscriptionDTO } from "@/domain/dto/subscription.types.d.ts";
import type { TeamDTO } from "@/domain/dto/team.types.d.ts";

interface TeamSubscriptionTabProps {
  team: TeamDTO;
  subscription: SubscriptionDTO | null;
}

export function TeamSubscriptionTab({
  team,
  subscription,
}: TeamSubscriptionTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="p-2 bg-success/10 rounded-lg">
          <Sparkles className="w-5 h-5 text-success" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Planos e Assinatura
          </h3>
          <p className="text-sm text-muted-foreground">
            Gerencie seu plano e método de pagamento
          </p>
        </div>
      </div>

      <TeamBillingSection team={team} subscription={subscription} />
    </div>
  );
}
