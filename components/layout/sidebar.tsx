"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  TrendingUp,
  Target,
  Tag,
  Wallet,
  Users,
  PieChart,
} from "lucide-react";

const navLinks = [
  { href: "/dashboard", label: "Visão Geral", icon: LayoutDashboard },
  { href: "/expenses", label: "Gastos", icon: TrendingUp },
  { href: "/budget", label: "Orçamento", icon: Target },
  { href: "/investments", label: "Investimentos", icon: Wallet },
  { href: "/categories", label: "Categorias", icon: Tag },
  { href: "/team", label: "Equipe", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-64 flex-col border-r bg-background sm:flex fixed left-0 top-0 z-30">
      {/* Logo Area */}
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold text-xl tracking-tight text-foreground"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <TrendingUp className="h-5 w-5" />
          </div>
          <span>Lemon</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <link.icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer Area (Opcional - Ex: Versão ou Link de Ajuda) */}
      <div className="border-t p-4">
        <p className="text-xs text-center text-muted-foreground">
          v1.0.0 • Beta
        </p>
      </div>
    </aside>
  );
}
