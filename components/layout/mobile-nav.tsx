"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, TrendingUp, Target, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function MobileNav() {
  const pathname = usePathname()

  const mainLinks = [
    { href: "/dashboard", label: "Início", icon: LayoutDashboard },
    { href: "/expenses", label: "Gastos", icon: TrendingUp },
    { href: "/budget", label: "Orçamento", icon: Target },
  ]

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 safe-area-bottom">
      <div className="flex h-16 items-center justify-around px-2">
        {mainLinks.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <link.icon className={cn("h-5 w-5", isActive && "fill-current/20")} />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          )
        })}

        {/* Menu "Mais" para itens secundários */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex flex-col items-center justify-center w-full h-full gap-1 text-muted-foreground hover:text-foreground focus:outline-none">
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[10px] font-medium">Mais</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 mb-2">
            <DropdownMenuItem asChild>
              <Link href="/investments">Investimentos</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/categories">Categorias</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/team">Equipe</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}