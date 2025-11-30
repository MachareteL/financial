"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/app/auth/auth-provider";
import { signOutAction } from "@/app/auth/_actions/auth.actions";
import { useRouter } from "next/navigation";
import { LogOut, User, Settings } from "lucide-react";

import { TeamSwitcher } from "./team-switcher";

export function UserNav() {
  const { session } = useAuth();
  const router = useRouter();

  if (!session) return null;

  const handleSignOut = async () => {
    await signOutAction();
    router.push("/auth");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full ring-offset-background transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src="" alt={session.user.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(session.user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session.user.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Mostra o TeamSwitcher dentro do menu apenas no Mobile (sm:hidden) */}
        <div className="sm:hidden px-2 py-1.5">
          <p className="text-xs font-semibold text-muted-foreground mb-2">
            Equipe Atual
          </p>
          <TeamSwitcher isMobile={true} />
        </div>
        <DropdownMenuSeparator className="sm:hidden" />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/account")}>
            <User className="mr-2 h-4 w-4" />
            <span>Meu Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/team")}>
            <User className="mr-2 h-4 w-4" />
            <span>Minha Equipe</span>
          </DropdownMenuItem>
          {/* Placeholder para futuras features */}
          <DropdownMenuItem disabled>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
