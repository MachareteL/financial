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
  Check,
  Bot,
} from "lucide-react";
import { notify } from "@/lib/notify-helper";
import {
  subscribeTeamAction,
  manageSubscriptionAction,
} from "../_actions/subscription.actions";
import type { Subscription } from "@/domain/entities/subscription";
import type { Team } from "@/domain/entities/team";
import { cn } from "@/lib/utils";

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
    <div className="space-y-8">
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

      {/* Toggle Switch */}
      {!isPro && (
        <div className="flex justify-center">
          <div className="bg-muted p-1 rounded-full inline-flex relative">
            <button
              onClick={() => setBillingInterval("month")}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 z-10",
                billingInterval === "month"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingInterval("year")}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 z-10 flex items-center gap-2",
                billingInterval === "year"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Anual
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700 hover:bg-green-100 border-0 text-[10px] px-1.5 h-5"
              >
                -25%
              </Badge>
            </button>
          </div>
        </div>
      )}

      {/* Pricing / Plan Card */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
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
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  Até 3 membros
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  Gestão de despesas básica
                </li>
                <li className="flex items-center gap-3 text-muted-foreground/50">
                  <X className="w-4 h-4 shrink-0" />
                  Sem leitura de recibos com IA
                </li>
                <li className="flex items-center gap-3 text-muted-foreground/50">
                  <X className="w-4 h-4 shrink-0" />
                  Sem suporte prioritário
                </li>
              </ul>
            </CardContent>
          </Card>
        )}

        {/* PRO Plan (Main Focus) */}
        <Card
          className={cn(
            "border-2 relative overflow-hidden transition-all duration-300",
            isPro
              ? "border-green-500 shadow-md md:col-span-2 lg:col-span-3"
              : "border-primary shadow-xl scale-105 md:scale-110 z-10 lg:col-span-2"
          )}
        >
          {!isPro && (
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-sm">
              RECOMENDADO
            </div>
          )}

          <div
            className={cn(
              "grid gap-6",
              isPro ? "md:grid-cols-2" : "md:grid-cols-5"
            )}
          >
            <div className={cn("p-6", isPro ? "" : "md:col-span-3")}>
              <CardHeader className="p-0 mb-6">
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
                    <CardDescription className="mt-1 text-base">
                      Poder total para sua equipe com IA e automação
                    </CardDescription>
                  </div>
                </div>
                {!isPro && (
                  <div className="mt-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-foreground tracking-tight">
                        {billingInterval === "month" ? "R$ 39,90" : "R$ 29,90"}
                      </span>
                      <span className="text-muted-foreground font-medium">
                        /mês
                      </span>
                    </div>
                    {billingInterval === "year" && (
                      <p className="text-sm text-green-600 font-medium mt-2 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Economia de R$ 120,00 por ano
                      </p>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-0 space-y-6">
                <div className="space-y-4">
                  <ul className="grid gap-3 text-sm sm:grid-cols-2">
                    <li className="flex items-center gap-3">
                      <div className="bg-primary/10 p-1 rounded-full">
                        <Infinity className="w-3 h-3 text-primary" />
                      </div>
                      <span>Membros ilimitados</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="bg-primary/10 p-1 rounded-full">
                        <Bot className="w-3 h-3 text-primary" />
                      </div>
                      <span>Leitura de recibos com IA</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="bg-primary/10 p-1 rounded-full">
                        <Zap className="w-3 h-3 text-primary" />
                      </div>
                      <span>Insights Financeiros</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="bg-primary/10 p-1 rounded-full">
                        <Shield className="w-3 h-3 text-primary" />
                      </div>
                      <span>Permissões avançadas</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="bg-primary/10 p-1 rounded-full">
                        <Headphones className="w-3 h-3 text-primary" />
                      </div>
                      <span>Suporte prioritário</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </div>

            <div
              className={cn(
                "p-6 flex flex-col justify-center bg-muted/20",
                isPro
                  ? "border-l"
                  : "md:col-span-2 border-t md:border-t-0 md:border-l"
              )}
            >
              {subscription ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Status da Assinatura
                    </p>
                    <p className="text-lg font-semibold text-green-600 flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> Ativa
                    </p>
                  </div>
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
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center mb-2">
                    <p className="text-sm text-muted-foreground">
                      Comece agora e transforme a gestão financeira da sua
                      equipe.
                    </p>
                  </div>
                  <Button
                    onClick={handleSubscribe}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
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
                  <p className="text-xs text-center text-muted-foreground">
                    Cancele a qualquer momento.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
