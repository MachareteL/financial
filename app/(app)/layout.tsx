import type React from "react";
import { TeamProvider } from "@/app/(app)/team/team-provider";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { InviteChecker } from "@/components/invite-checker";

import { SubscriptionPromoModal } from "@/components/layout/subscription-promo-modal";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    // 1. O TeamProvider garante que temos um time selecionado
    <TeamProvider>
      <SubscriptionPromoModal />
      <div className="min-h-screen w-full bg-gray-50 dark:bg-zinc-900">
        <InviteChecker />
        {/* 2. Sidebar (Visível apenas em Desktop) */}
        <Sidebar />

        {/* Container Principal (Empurrado para a direita no Desktop) */}
        <div className="flex flex-col min-h-screen sm:pl-64 transition-all duration-300 ease-in-out">
          {/* 3. Header (Topo, com UserNav e TeamSwitcher) */}
          <Header />

          {/* 4. Área de Conteúdo */}
          <main className="flex-1 p-4 pb-24 sm:pb-6 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            <div className="mx-auto max-w-7xl space-y-6">{children}</div>
          </main>

          {/* 5. Navegação Mobile (Visível apenas em Mobile) */}
          <MobileNav />
        </div>
      </div>
    </TeamProvider>
  );
}
