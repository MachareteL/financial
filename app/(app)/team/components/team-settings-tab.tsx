"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { useTeam } from "@/app/(app)/team/team-provider";
import { notify } from "@/lib/notify-helper";
import { updateTeamUseCase } from "@/infrastructure/dependency-injection";
import { useAuth } from "@/app/auth/auth-provider";
import { usePermission } from "@/hooks/use-permission";

export function TeamSettingsTab() {
  const { currentTeam } = useTeam();
  const { session } = useAuth();
  const { can } = usePermission();
  const [name, setName] = useState(currentTeam?.team.name || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam || !session?.user) return;

    setIsLoading(true);
    try {
      await updateTeamUseCase.execute(
        currentTeam.team.id,
        name,
        session.user.id
      );
      notify.success("Equipe atualizada com sucesso!");
      // Atualiza o contexto global do time
      window.location.reload();
    } catch (error: any) {
      notify.error(error, "atualizar a equipe");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Configurações da Equipe
        </h3>
        <p className="text-sm text-muted-foreground">
          Gerencie os detalhes e preferências da sua equipe.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Geral</CardTitle>
          <CardDescription>
            Atualize o nome e informações básicas da sua equipe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateTeam} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="team-name">Nome da Equipe</Label>
              <Input
                id="team-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Minha Equipe"
                required
                minLength={3}
                disabled={!can("MANAGE_TEAM")}
              />
              <p className="text-[0.8rem] text-muted-foreground">
                Este é o nome visível para todos os membros da equipe.
              </p>
            </div>
            {can("MANAGE_TEAM") && (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar Alterações
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
