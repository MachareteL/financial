import { UserNav } from "@/components/layout/user-nav";
import { TeamSwitcher } from "@/components/layout/team-switcher";
import { NotificationsNav } from "@/components/layout/notifications-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6 lg:px-8">
      {/* Lado Esquerdo: Trocador de Time (Visível em Desktop) */}
      <div className="hidden sm:flex items-center gap-4">
        <TeamSwitcher />
      </div>

      {/* Lado Esquerdo Mobile: Título ou Logo Simplificado */}
      <div className="flex sm:hidden font-semibold text-lg">Finanças</div>

      {/* Lado Direito: Ações do Usuário */}
      <div className="flex items-center gap-4">
        <NotificationsNav />
        <UserNav />
      </div>
    </header>
  );
}
