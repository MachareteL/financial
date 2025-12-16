"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useTeam } from "@/app/(app)/team/team-provider";
import Link from "next/link";
import { Clock, Zap, Crown } from "lucide-react";
import { DateUtils } from "@/domain/utils/date.utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { UpgradeModal } from "@/components/subscription/upgrade-modal";
import { cn } from "@/lib/utils";

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
        ? DateUtils.parse(currentTeam.team.trialEndsAt)
        : null;
      const isTrialActive = trialEndsAt ? trialEndsAt > DateUtils.now() : false;
      const daysRemaining = trialEndsAt
        ? Math.ceil(
            (trialEndsAt.getTime() - DateUtils.now().getTime()) /
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
    return <div className="h-7 w-20 bg-muted animate-pulse rounded-full"></div>;
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
                    variant="outline"
                    className="gap-1.5 bg-info/10 text-info border-info/20 hover:bg-info/20 hover:border-info/30 transition-all cursor-pointer h-7 px-3"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-medium">
                      Teste: {status.daysRemaining}d
                    </span>
                  </Badge>
                ) : (
                  <Badge className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 border-0 transition-all cursor-pointer shadow-sm hover:shadow-md h-7 px-3 group">
                    <Crown className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold tracking-wide">PRO</span>
                  </Badge>
                )
              ) : (
                <Badge
                  variant="outline"
                  className={cn(
                    "gap-1.5 h-7 px-3 transition-all cursor-pointer group",
                    "border-muted-foreground/30 text-muted-foreground",
                    "hover:border-primary/50 hover:text-primary hover:bg-primary/5"
                  )}
                >
                  <Zap className="w-3.5 h-3.5 group-hover:fill-primary transition-colors" />
                  <span className="font-medium">Assinar</span>
                </Badge>
              )}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p>
              {status.isPro
                ? status.isTrial
                  ? "Período de testes ativo. Clique para ver detalhes."
                  : "Sua assinatura PRO está ativa. Aproveite todos os recursos!"
                : "Desbloqueie recursos ilimitados com o plano PRO."}
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
