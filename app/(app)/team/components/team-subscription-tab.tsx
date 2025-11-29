"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertTriangle, CreditCard } from "lucide-react";
import { notify } from "@/lib/notify-helper";
import {
  subscribeTeamAction,
  manageSubscriptionAction,
} from "../_actions/subscription.actions";
import type { Subscription } from "@/domain/entities/subscription";
import type { Team } from "@/domain/entities/team";

interface TeamSubscriptionTabProps {
  team: Team;
  subscription: Subscription | null;
}

export function TeamSubscriptionTab({
  team,
  subscription,
}: TeamSubscriptionTabProps) {
  const [isLoading, setIsLoading] = useState(false);

  const isPro = team.isPro(!!subscription && subscription.isActive());
  const trialEndsAt = team.trialEndsAt ? new Date(team.trialEndsAt) : null;
  const isTrialActive = trialEndsAt && trialEndsAt > new Date();
  const daysRemaining = trialEndsAt
    ? Math.ceil(
        (trialEndsAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  const [billingInterval, setBillingInterval] = useState<"month" | "year">(
    "month"
  );

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const priceId =
        billingInterval === "month"
          ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY
          : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY;

      if (!priceId) {
        throw new Error("Price ID not configured");
      }
      await subscribeTeamAction(team.id, priceId);
    } catch (error: any) {
      notify.error(error, "iniciar assinatura");
      setIsLoading(false);
    }
  };

  const handleManage = async () => {
    setIsLoading(true);
    try {
      await manageSubscriptionAction(team.id);
    } catch (error: any) {
      notify.error(error, "gerenciar assinatura");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Plano Atual</span>
            {isPro ? (
              <Badge className="bg-green-600 hover:bg-green-700">PRO</Badge>
            ) : (
              <Badge variant="secondary">GRÁTIS</Badge>
            )}
          </CardTitle>
          <CardDescription>Gerencie sua assinatura e cobrança.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isTrialActive && !subscription && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">
                  Período de Testes Ativo
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  Você tem acesso total a todas as funcionalidades PRO por mais{" "}
                  <strong>{daysRemaining} dias</strong>.
                </p>
              </div>
            </div>
          )}

          {!isPro && !isTrialActive && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-900">
                  Seu período de testes acabou
                </h4>
                <p className="text-sm text-amber-700 mt-1">
                  Assine o plano PRO para continuar usando funcionalidades
                  avançadas como a Leitura de Recibos com IA.
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Plano PRO</h3>
                {!subscription && (
                  <div className="flex items-center bg-slate-100 rounded-lg p-1">
                    <button
                      onClick={() => setBillingInterval("month")}
                      className={`text-xs px-3 py-1 rounded-md transition-all ${
                        billingInterval === "month"
                          ? "bg-white shadow-sm font-medium text-slate-900"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Mensal
                    </button>
                    <button
                      onClick={() => setBillingInterval("year")}
                      className={`text-xs px-3 py-1 rounded-md transition-all ${
                        billingInterval === "year"
                          ? "bg-white shadow-sm font-medium text-slate-900"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Anual
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <div className="text-2xl font-bold">
                  {billingInterval === "month" ? "R$ 39,90" : "R$ 29,90"}
                  <span className="text-sm font-normal text-muted-foreground">
                    /mês
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {billingInterval === "month"
                    ? "Cancele quando quiser"
                    : "Cobrado anualmente (R$ 358,80)"}
                </div>
              </div>

              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Membros ilimitados
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Leitura de recibos com IA
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Suporte prioritário
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          {subscription ? (
            <Button
              onClick={handleManage}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CreditCard className="w-4 h-4 mr-2" />
              )}
              Gerenciar Assinatura
            </Button>
          ) : (
            <Button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                "Assinar Agora"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
