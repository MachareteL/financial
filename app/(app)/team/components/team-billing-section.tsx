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
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Sparkles,
  Infinity,
  Shield,
  Headphones,
  Zap,
  X,
} from "lucide-react";
import { notify } from "@/lib/notify-helper";
import {
  subscribeTeamAction,
  manageSubscriptionAction,
} from "../_actions/subscription.actions";
import type { Subscription } from "@/domain/entities/subscription";
import type { Team } from "@/domain/entities/team";

interface TeamBillingSectionProps {
  team: Team;
  subscription: Subscription | null;
}

export function TeamBillingSection({
  team,
  subscription,
}: TeamBillingSectionProps) {
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
      {/* Status Banner */}
      {isTrialActive && !subscription && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 flex flex-col sm:flex-row items-start gap-4 shadow-sm">
          <div className="bg-blue-100 p-2 rounded-full">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 text-lg">
              Período de Testes Premium Ativo
            </h4>
            <p className="text-blue-700 mt-1 max-w-xl">
              Aproveite acesso total a todas as funcionalidades PRO por mais{" "}
              <strong>{daysRemaining} dias</strong>.
            </p>
          </div>
        </div>
      )}

      {!isPro && !isTrialActive && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex flex-col sm:flex-row items-start gap-4">
          <div className="bg-amber-100 p-2 rounded-full">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h4 className="font-semibold text-amber-900 text-lg">
              Seu período de testes acabou
            </h4>
            <p className="text-amber-700 mt-1 max-w-xl">
              Assine o plano PRO para desbloquear novamente as funcionalidades
              avançadas.
            </p>
          </div>
        </div>
      )}

      {/* Pricing / Plan Card */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Free Plan (Comparison) */}
        {!isPro && (
          <Card className="border-muted bg-muted/30 opacity-75 hover:opacity-100 transition-opacity">
            <CardHeader>
              <CardTitle className="text-xl text-muted-foreground">
                Básico
              </CardTitle>
              <div className="text-3xl font-bold mt-2">Grátis</div>
              <CardDescription>Para uso pessoal simples</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Até 3 membros
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Gestão de despesas básica
                </li>
                <li className="flex items-center gap-2 text-muted-foreground/50">
                  <X className="w-4 h-4" />
                  Sem leitura de recibos com IA
                </li>
                <li className="flex items-center gap-2 text-muted-foreground/50">
                  <X className="w-4 h-4" />
                  Sem suporte prioritário
                </li>
              </ul>
            </CardContent>
          </Card>
        )}

        {/* PRO Plan (Main Focus) */}
        <Card
          className={`border-2 relative overflow-hidden ${
            isPro
              ? "border-green-500 shadow-md"
              : "border-indigo-500 shadow-xl scale-105 md:scale-105 z-10"
          }`}
        >
          {!isPro && (
            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              RECOMENDADO
            </div>
          )}
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  PRO
                  {isPro && (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                      ATIVO
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="mt-1">
                  Poder total para sua equipe
                </CardDescription>
              </div>
              {!isPro && (
                <div className="bg-indigo-50 p-1 rounded-lg flex flex-col gap-1">
                  <button
                    onClick={() => setBillingInterval("month")}
                    className={`text-xs px-3 py-1.5 rounded-md transition-all font-medium ${
                      billingInterval === "month"
                        ? "bg-indigo-500 text-white shadow-sm"
                        : "text-indigo-700 hover:bg-indigo-100"
                    }`}
                  >
                    Mensal
                  </button>
                  <button
                    onClick={() => setBillingInterval("year")}
                    className={`text-xs px-3 py-1.5 rounded-md transition-all font-medium ${
                      billingInterval === "year"
                        ? "bg-indigo-500 text-white shadow-sm"
                        : "text-indigo-700 hover:bg-indigo-100"
                    }`}
                  >
                    Anual (-25%)
                  </button>
                </div>
              )}
            </div>
            {!isPro && (
              <div className="mt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">
                    {billingInterval === "month" ? "R$ 39,90" : "R$ 29,90"}
                  </span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                {billingInterval === "year" && (
                  <p className="text-xs text-indigo-600 font-medium mt-1">
                    Cobrado anualmente (R$ 358,80)
                  </p>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3">
                  <div className="bg-green-100 p-1 rounded-full">
                    <Infinity className="w-3 h-3 text-green-600" />
                  </div>
                  <span>Membros e times ilimitados</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-green-100 p-1 rounded-full">
                    <Shield className="w-3 h-3 text-green-600" />
                  </div>
                  <span>Permissões avançadas</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-green-100 p-1 rounded-full">
                    <Zap className="w-3 h-3 text-green-600" />
                  </div>
                  <span>Sincronização em tempo real</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-green-100 p-1 rounded-full">
                    <Headphones className="w-3 h-3 text-green-600" />
                  </div>
                  <span>Suporte prioritário</span>
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            {subscription ? (
              <Button
                onClick={handleManage}
                disabled={isLoading}
                variant="outline"
                className="w-full"
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
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md transition-all hover:shadow-lg"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Assinar Agora
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
