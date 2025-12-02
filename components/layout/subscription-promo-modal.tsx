"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTeam } from "@/app/(app)/team/team-provider";
import { CheckCircle2, Sparkles } from "lucide-react";
import { subscribeTeamAction } from "@/app/(app)/team/_actions/subscription.actions";
import { notify } from "@/lib/notify-helper";

export function SubscriptionPromoModal() {
  const { currentTeam } = useTeam();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!currentTeam) return;

    const hasSeenPromo = sessionStorage.getItem("hasSeenSubscriptionPromo");
    if (hasSeenPromo) return;

    const subscription = currentTeam.subscription;
    const hasActiveSub = subscription ? subscription.isActive() : false;

    // Don't show if already PRO (unless trial is ending soon, logic below)
    if (hasActiveSub) return;

    // Show for Free users or Trial users
    if (!hasActiveSub) {
      // Delay slightly to not clash with other initial renders
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem("hasSeenSubscriptionPromo", "true");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentTeam]);

  const handleSubscribe = async (interval: "month" | "year") => {
    if (!currentTeam) return;
    try {
      // TODO: Support multiple price IDs in environment variables
      // For now, we fallback to the default price ID or a placeholder
      const priceId =
        interval === "month"
          ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY
          : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY;

      if (!priceId) {
        throw new Error("Price ID not configured");
      }

      await subscribeTeamAction(currentTeam.team.id, priceId);
    } catch (error: unknown) {
      notify.error(error, "iniciar assinatura");
    }
  };

  if (!currentTeam) return null;

  const trialEndsAt = currentTeam.team.trialEndsAt
    ? new Date(currentTeam.team.trialEndsAt)
    : null;
  const isTrialActive = trialEndsAt ? trialEndsAt > new Date() : false;
  const daysRemaining = trialEndsAt
    ? Math.ceil(
        (trialEndsAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {isTrialActive ? (
              <>
                <ClockIcon className="w-6 h-6 text-blue-600" />
                Seu período de testes acaba em {daysRemaining} dias!
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 text-amber-500" />
                Desbloqueie todo o potencial com o Plano PRO
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            {isTrialActive
              ? "Não perca o acesso às funcionalidades exclusivas que você já está usando."
              : "Tenha acesso a funcionalidades de Inteligência Artificial para automatizar suas finanças."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                O que você ganha:
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  <span className="text-sm">
                    Leitura automática de recibos com IA
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  <span className="text-sm">
                    Insights financeiros inteligentes
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  <span className="text-sm">Membros ilimitados no time</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  <span className="text-sm">Suporte prioritário</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 justify-center">
              <div
                className="border rounded-xl p-4 hover:border-blue-500 transition-colors cursor-pointer relative bg-slate-50/50"
                onClick={() => handleSubscribe("year")}
              >
                <div className="absolute -top-3 right-4 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                  MELHOR VALOR
                </div>
                <div className="font-semibold">Anual</div>
                <div className="text-2xl font-bold">
                  R$ 29,90
                  <span className="text-sm font-normal text-muted-foreground">
                    /mês
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Cobrado anualmente (R$ 358,80)
                </div>
              </div>

              <div
                className="border rounded-xl p-4 hover:border-blue-500 transition-colors cursor-pointer bg-white"
                onClick={() => handleSubscribe("month")}
              >
                <div className="font-semibold">Mensal</div>
                <div className="text-2xl font-bold">
                  R$ 39,90
                  <span className="text-sm font-normal text-muted-foreground">
                    /mês
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Cancele quando quiser
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Talvez depois
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
