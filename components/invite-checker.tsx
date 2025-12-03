"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { getPendingInvitesUseCase } from "@/infrastructure/dependency-injection";
import { notify } from "@/lib/notify-helper";
import { useRouter, usePathname } from "next/navigation";

export function InviteChecker() {
  const { session } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasChecked = useRef(false);

  useEffect(() => {
    const checkInvites = async () => {
      // Evita checar se já estiver na página de convites ou onboarding
      if (pathname === "/invites" || pathname === "/onboarding") return;

      // Evita checagem duplicada na mesma montagem/sessão
      if (hasChecked.current) return;

      if (!session?.user?.email) return;

      try {
        const invites = await getPendingInvitesUseCase.execute(
          session.user.email
        );

        if (invites.length > 0) {
          hasChecked.current = true; // Marca como checado para não spammar

          notify.info(`Você tem ${invites.length} convite(s) pendente(s)!`, {
            description: "Clique para visualizar e responder.",
            action: {
              label: "Ver Convites",
              onClick: () => router.push("/invites"),
            },
            duration: 8000, // Duração maior para garantir visibilidade
          });
        }
      } catch (error) {
        console.error("Erro ao verificar convites:", error);
      }
    };

    if (session?.user) {
      checkInvites();
    }
  }, [session, router, pathname]);

  return null; // Componente invisível
}
