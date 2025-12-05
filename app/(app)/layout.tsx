import { Suspense } from "react";
import { TeamProvider } from "@/app/(app)/team/team-provider";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { InviteChecker } from "@/app/(app)/_components/invite-checker";

import { SubscriptionCheck } from "@/components/subscription/subscription-check";
import { ProCelebrationModal } from "@/components/subscription/pro-celebration-modal";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    // 1. O TeamProvider garante que temos um time selecionado
    <TeamProvider>
      <SubscriptionCheck />
      <Suspense fallback={null}>
        <ProCelebrationModal />
      </Suspense>
      <div className="min-h-screen w-full bg-background">
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
