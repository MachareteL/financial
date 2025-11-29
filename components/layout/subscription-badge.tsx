"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useTeam } from "@/app/(app)/team/team-provider";
import Link from "next/link";
import { Loader2, Sparkles, Clock, AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { UpgradeModal } from "@/app/(app)/components/upgrade-modal";

export function SubscriptionBadge() {
  const { currentTeam } = useTeam();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [status, setStatus] = useState<{
    isPro: boolean;
    isTrial: boolean;
    daysRemaining: number;
    loading: boolean;
  }>({
    isPro: false,
    isTrial: false,
    daysRemaining: 0,
    loading: true,
  });

  useEffect(() => {
    if (!currentTeam) return;

    const calculateStatus = () => {
      const subscription = currentTeam.subscription;
      const hasActiveSub = subscription ? subscription.isActive() : false;

      const trialEndsAt = currentTeam.team.trialEndsAt
        ? new Date(currentTeam.team.trialEndsAt)
        : null;
      const isTrialActive = trialEndsAt ? trialEndsAt > new Date() : false;
      const daysRemaining = trialEndsAt
        ? Math.ceil(
            (trialEndsAt.getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0;

      setStatus({
        isPro: hasActiveSub || isTrialActive,
        isTrial: isTrialActive && !hasActiveSub,
        daysRemaining,
        loading: false,
      });
    };

    calculateStatus();
  }, [currentTeam]);

  if (status.loading) {
    return (
      <div className="h-6 w-16 bg-slate-100 animate-pulse rounded-full"></div>
    );
  }

  const handleBadgeClick = (e: React.MouseEvent) => {
    if (!status.isPro) {
      e.preventDefault();
      setIsUpgradeModalOpen(true);
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/team?tab=subscription" onClick={handleBadgeClick}>
              {status.isPro ? (
                status.isTrial ? (
                  <Badge
                    variant="secondary"
                    className="gap-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 transition-colors cursor-pointer"
                  >
                    <Clock className="w-3 h-3" />
                    Teste: {status.daysRemaining} dias
                  </Badge>
                ) : (
                  <Badge className="gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-none text-white transition-all cursor-pointer shadow-sm">
                    <Sparkles className="w-3 h-3" />
                    PRO
                  </Badge>
                )
              ) : (
                <Badge
                  variant="outline"
                  className="gap-1.5 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <AlertCircle className="w-3 h-3" />
                  Assinar
                </Badge>
              )}
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {status.isPro
                ? status.isTrial
                  ? "Período de testes ativo. Clique para assinar."
                  : "Sua assinatura está ativa."
                : "Funcionalidades limitadas. Clique para assinar."}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </>
  );
}
