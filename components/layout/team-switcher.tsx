"use client";

import * as React from "react";
import {
  ChevronsUpDown,
  Check,
  PlusCircle,
  Users,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTeam } from "@/app/(app)/team/team-provider";
import { useAuth } from "@/components/providers/auth-provider";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { createTeamUseCase } from "@/infrastructure/dependency-injection";
import { notify } from "@/lib/notify-helper";

interface TeamSwitcherProps {
  isMobile?: boolean;
}

export function TeamSwitcher({ isMobile = false }: TeamSwitcherProps) {
  const { currentTeam, teams, setCurrentTeam } = useTeam();
  const { session } = useAuth();

  const [open, setOpen] = React.useState(false);
  const [showNewTeamDialog, setShowNewTeamDialog] = React.useState(false);
  const [teamName, setTeamName] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  if (!currentTeam) return null;

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;
    if (!teamName.trim()) {
      notify.error("O nome da equipe não pode ser vazio.", "criar a equipe");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Cria o time usando a arquitetura limpa
      const newTeam = await createTeamUseCase.execute({
        teamName: teamName,
        userId: session.user.id,
      });

      // 2. Feedback
      notify.success("Equipe criada com sucesso!", {
        description: `A equipe "${newTeam.name}" foi criada.`,
      });

      // 3. Fecha modais e limpa form
      setShowNewTeamDialog(false);
      setOpen(false);
      setTeamName("");
    } catch (error: unknown) {
      console.error(error);
      notify.error(error, "criar a equipe");
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDERIZAÇÃO MOBILE (Lista Simples) ---
  if (isMobile) {
    return (
      <div className="flex flex-col gap-1">
        {teams.map((membership) => (
          <Button
            key={membership.team.id}
            variant={
              currentTeam.team.id === membership.team.id ? "secondary" : "ghost"
            }
            size="sm"
            className="justify-start w-full font-normal"
            onClick={() => setCurrentTeam(membership)}
          >
            <Users className="mr-2 h-4 w-4" />
            {membership.team.name}
            {currentTeam.team.id === membership.team.id && (
              <Check className="ml-auto h-4 w-4" />
            )}
          </Button>
        ))}
        {/* Botão que abre o Dialog (controlado pelo estado showNewTeamDialog) */}
        <Dialog open={showNewTeamDialog} onOpenChange={setShowNewTeamDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="justify-start w-full mt-2 border-dashed"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Criar Nova Equipe
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Equipe</DialogTitle>
              <DialogDescription>
                Adicione uma nova equipe para gerenciar despesas separadamente.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTeam}>
              <div className="space-y-4 py-2 pb-4">
                <div className="space-y-2">
                  <Label htmlFor="name-mobile">Nome da Equipe</Label>
                  <Input
                    id="name-mobile"
                    placeholder="Ex: Casa de Praia, Empresa..."
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowNewTeamDialog(false)}
                  type="button"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  ) : (
                    "Criar"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // --- RENDERIZAÇÃO DESKTOP (Popover + Command + Dialog) ---
  return (
    <Dialog open={showNewTeamDialog} onOpenChange={setShowNewTeamDialog}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Selecione uma equipe"
            className="w-[200px] justify-between"
          >
            <span className="flex items-center truncate">
              <Users className="mr-2 h-4 w-4 opacity-50" />
              {currentTeam.team.name}
            </span>
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandInput placeholder="Buscar equipe..." />
              <CommandEmpty>Nenhuma equipe encontrada.</CommandEmpty>
              <CommandGroup heading="Equipes">
                {teams.map((membership) => (
                  <CommandItem
                    key={membership.team.id}
                    onSelect={() => {
                      setCurrentTeam(membership);
                      setOpen(false);
                    }}
                    className="text-sm cursor-pointer"
                  >
                    <Users className="mr-2 h-4 w-4 opacity-50" />
                    {membership.team.name}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        currentTeam.team.id === membership.team.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                {/* O DialogTrigger deve estar aqui para abrir o modal */}
                <DialogTrigger asChild>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      setShowNewTeamDialog(true);
                    }}
                    className="cursor-pointer"
                  >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Criar Equipe
                  </CommandItem>
                </DialogTrigger>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* CONTEÚDO DO DIALOG (FORA DO POPOVER PARA EVITAR BUG DE FOCO) */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Equipe</DialogTitle>
          <DialogDescription>
            Adicione uma nova equipe para gerenciar despesas separadamente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateTeam}>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Equipe</Label>
              <Input
                id="name"
                placeholder="Ex: Família Silva, Projeto X..."
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewTeamDialog(false)}
              type="button"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
              ) : (
                "Continuar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
