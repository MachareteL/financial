"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Infinity,
  Bot,
  Zap,
  Shield,
  Headphones,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { subscribeTeamAction } from "../../_actions/subscription.actions";
import { notify } from "@/lib/notify-helper";

interface UpgradePricingCardsProps {
  teamId: string;
  isTrialActive: boolean;
}

export function UpgradePricingCards({
  teamId,
  isTrialActive,
}: UpgradePricingCardsProps) {
  const [isLoading, setIsLoading] = useState(false);
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
      const url = await subscribeTeamAction(teamId, priceId);
      if (url) {
        window.location.href = url;
      } else {
        throw new Error(
          "Tivemos um problema para gerar o link de pagamento. Tente novamente."
        );
      }
    } catch (error: unknown) {
      notify.error(error, "iniciar assinatura");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-8 animate-in fade-in zoom-in-95 duration-500 max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="text-center space-y-2 max-w-lg">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
          Eleve o nível da sua equipe
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Desbloqueie automação com IA, membros ilimitados e insights poderosos
          para escalar sua gestão financeira.
        </p>
      </div>

      {/* Toggle */}
      <div className="flex justify-center">
        <div className="bg-muted/50 p-1 rounded-full inline-flex relative border shadow-sm backdrop-blur-sm">
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
              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 text-[10px] px-1.5 h-5 pointer-events-none"
            >
              -50%
            </Badge>
          </button>
        </div>
      </div>

      {/* Main Single Card Layout */}
      <Card className="w-full relative overflow-hidden border-2 border-primary/20 bg-background/50 backdrop-blur-xl shadow-2xl">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="grid md:grid-cols-3 gap-6 relative z-10">
          {/* Left Column: Features */}
          <div className="md:col-span-2 p-6 sm:p-8 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge
                  variant="outline"
                  className="border-primary/50 text-primary px-3 py-1"
                >
                  PLANO PRO
                </Badge>
                {isTrialActive && (
                  <Badge
                    variant="secondary"
                    className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0"
                  >
                    Seu plano atual (Trial)
                  </Badge>
                )}
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                Tudo o que você precisa para crescer
              </h3>
              <p className="text-muted-foreground">
                Substitua processos manuais por automação inteligente.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
              <FeatureItem icon={Infinity} text="Membros ilimitados" />
              <FeatureItem icon={Bot} text="Leitura de recibos com IA" />
              <FeatureItem icon={Zap} text="Automação de despesas" />
              <FeatureItem icon={Shield} text="Permissões avançadas" />
              <FeatureItem icon={Headphones} text="Suporte prioritário" />
              <FeatureItem icon={Sparkles} text="Novas features primeiro" />
            </div>

            <div className="pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
                Também inclui:
              </p>
              <div className="text-sm text-muted-foreground flex flex-wrap gap-x-6 gap-y-2">
                <span className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-emerald-500" /> Todas features
                  do Grátis
                </span>
                <span className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-emerald-500" /> Exportação de
                  dados
                </span>
                <span className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-emerald-500" /> App Mobile
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & CTA */}
          <div className="bg-muted/30 md:border-l border-border/50 p-6 sm:p-8 flex flex-col justify-center items-center text-center space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Investimento
              </p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl sm:text-5xl font-bold tracking-tight">
                  {billingInterval === "month" ? "R$ 39" : "R$ 19"}
                </span>
                <span className="text-xl font-bold">,90</span>
                <span className="text-muted-foreground font-medium self-end mb-1">
                  /mês
                </span>
              </div>
              {billingInterval === "year" && (
                <Badge
                  variant="outline"
                  className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20"
                >
                  Cobrado R$ 238,80/ano
                </Badge>
              )}
            </div>

            <div className="w-full space-y-4">
              <Button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="w-full h-12 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <>
                    {isTrialActive ? "Manter Acesso PRO" : "Assinar Agora"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Cancela quando quiser.</p>
                <p>7 dias de garantia.</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Footer / Trust */}
      <div className="text-center pt-4">
        <p className="text-sm text-muted-foreground/60 flex items-center gap-2 justify-center">
          <ShieldCheck className="w-4 h-4" /> Pagamento 100% seguro via Stripe
        </p>
      </div>
    </div>
  );
}

function FeatureItem({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-primary/10 p-2 rounded-lg shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <span className="text-sm font-medium text-foreground/90">{text}</span>
    </div>
  );
}
