"use client";

import { AlertTriangle, Sparkles, Info } from "lucide-react";
import type { Subscription } from "@/domain/entities/subscription";
import type { Team } from "@/domain/entities/team";
import { cn } from "@/lib/utils";

interface SubscriptionAlertsProps {
  subscription: Subscription | null;
  isPro: boolean;
  isTrialActive: boolean;
  daysRemaining: number;
}

export function SubscriptionAlerts({
  subscription,
  isPro,
  isTrialActive,
  daysRemaining,
}: SubscriptionAlertsProps) {
  // 1. Trial Active
  if (isTrialActive && !subscription) {
    return (
      <div className="bg-gradient-to-r from-info/10 to-info/5 border border-info/20 rounded-xl p-6 flex flex-col sm:flex-row items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="bg-info/20 p-2 rounded-full shrink-0">
          <Sparkles className="w-5 h-5 text-info" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground text-lg">
            Período de Testes Premium Ativo
          </h4>
          <p className="text-muted-foreground mt-1 max-w-xl text-sm">
            Aproveite acesso total a todas as funcionalidades PRO por mais{" "}
            <strong>{daysRemaining} dias</strong>.
          </p>
        </div>
      </div>
    );
  }

  // 2. Subscription Canceled (but potentially still active until period end)
  if (subscription?.cancelAtPeriodEnd) {
    return (
      <div className="bg-warning/5 border border-warning/20 rounded-xl p-6 flex flex-col sm:flex-row items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="bg-warning/10 p-2 rounded-full shrink-0">
          <Info className="w-5 h-5 text-warning" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground text-lg">
            Assinatura Cancelada
          </h4>
          <p className="text-muted-foreground mt-1 max-w-xl text-sm">
            Sua assinatura foi cancelada e expirará em{" "}
            <strong>
              {subscription.currentPeriodEnd?.toLocaleDateString()}
            </strong>
            . Você pode reativá-la a qualquer momento antes dessa data.
          </p>
        </div>
      </div>
    );
  }

  // 3. Past Due / Payment Issues
  if (
    subscription &&
    ["past_due", "incomplete", "unpaid"].includes(subscription.status)
  ) {
    return (
      <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6 flex flex-col sm:flex-row items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="bg-destructive/10 p-2 rounded-full shrink-0">
          <AlertTriangle className="w-5 h-5 text-destructive" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground text-lg">
            Problema com o Pagamento
          </h4>
          <p className="text-muted-foreground mt-1 max-w-xl text-sm">
            Houve um problema ao processar seu pagamento. Atualize seu método de
            pagamento para evitar a interrupção dos serviços.
          </p>
        </div>
      </div>
    );
  }

  // 4. Trial Ended / Free Plan (Encouragement to Upgrade)
  // Only show this if they are NOT Pro and NOT on Trial (i.e. strictly Free)
  if (!isPro && !isTrialActive) {
    return (
      <div className="bg-muted/50 border border-muted-foreground/10 rounded-xl p-6 flex flex-col sm:flex-row items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="bg-muted-foreground/10 p-2 rounded-full shrink-0">
          <AlertTriangle className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground text-lg">
            Seu período de testes acabou
          </h4>
          <p className="text-muted-foreground mt-1 max-w-xl text-sm">
            Você está no plano Grátis. Assine o plano PRO para desbloquear
            funcionalidades avançadas, IA e membros ilimitados.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
