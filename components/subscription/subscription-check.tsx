"use client";

import { useEffect, useState } from "react";
import { useTeam } from "@/app/(app)/team/team-provider";
import { UpgradeModal } from "./upgrade-modal";

export function SubscriptionCheck() {
  const { currentTeam } = useTeam();
  const [isOpen, setIsOpen] = useState(false);
  const [modalProps, setModalProps] = useState<{
    title?: string;
    description?: string;
  }>({});

  useEffect(() => {
    if (!currentTeam) return;

    const hasSeenPromo = sessionStorage.getItem("hasSeenSubscriptionPromo");
    if (hasSeenPromo) return;

    const subscription = currentTeam.subscription;
    const hasActiveSub = subscription ? subscription.isActive() : false;

    // Don't show if already PRO
    if (hasActiveSub) return;

    // Check for trial status
    const trialEndsAt = currentTeam.team.trialEndsAt
      ? new Date(currentTeam.team.trialEndsAt)
      : null;
    const isTrialActive = trialEndsAt ? trialEndsAt > new Date() : false;
    const daysRemaining = trialEndsAt
      ? Math.ceil(
          (trialEndsAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;

    // Configure modal content based on state
    if (isTrialActive) {
      setModalProps({
        title: `Seu período de testes acaba em ${daysRemaining} dias!`,
        description:
          "Não perca o acesso às funcionalidades exclusivas que você já está usando.",
      });
    } else {
      setModalProps({
        title: "Desbloqueie todo o potencial com o Plano PRO",
        description:
          "Tenha acesso a funcionalidades de Inteligência Artificial para automatizar suas finanças.",
      });
    }

    // Show for Free users or Trial users
    // Delay slightly to not clash with other initial renders
    const timer = setTimeout(() => {
      setIsOpen(true);
      sessionStorage.setItem("hasSeenSubscriptionPromo", "true");
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentTeam]);

  if (!currentTeam) return null;

  return (
    <UpgradeModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title={modalProps.title}
      description={modalProps.description}
    />
  );
}
