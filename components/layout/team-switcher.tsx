"use client"

import * as React from "react"
import { ChevronsUpDown, Check, PlusCircle, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTeam } from "@/app/(app)/team/team-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/pop-ver"

interface TeamSwitcherProps {
  isMobile?: boolean
}

export function TeamSwitcher({ isMobile = false }: TeamSwitcherProps) {
  const { currentTeam, teams, setCurrentTeam } = useTeam()
  const router = useRouter()
  const [open, setOpen] = React.useState(false)

  // Evita erro se o contexto ainda não carregou
  if (!currentTeam) return null

  // Versão Mobile: Renderiza apenas uma lista simples (para dentro do menu hamburguer)
  if (isMobile) {
    return (
      <div className="flex flex-col gap-1">
        {teams.map((membership) => (
            <Button
                key={membership.team.id}
                variant={currentTeam.team.id === membership.team.id ? "secondary" : "ghost"}
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
         <Button
            variant="outline"
            size="sm"
            className="justify-start w-full mt-2 border-dashed"
            onClick={() => router.push("/onboarding")}
        >
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Equipe
        </Button>
      </div>
    )
  }

  // Versão Desktop: Popover com busca (Command)
  return (
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
                    setCurrentTeam(membership)
                    setOpen(false)
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
              <CommandItem
                onSelect={() => {
                  setOpen(false)
                  router.push("/onboarding")
                }}
                className="cursor-pointer"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Criar Equipe
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}