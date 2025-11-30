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
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  Save,
  Bot,
  Sparkles,
  Zap,
  Bell,
  BrainCircuit,
  LineChart,
} from "lucide-react";
import { useTeam } from "@/app/(app)/team/team-provider";
import { notify } from "@/lib/notify-helper";
import { updateTeamUseCase } from "@/infrastructure/dependency-injection";
import { useAuth } from "@/app/auth/auth-provider";
import { usePermission } from "@/hooks/use-permission";
import type { Subscription } from "@/domain/entities/subscription";
import type { Team } from "@/domain/entities/team";
import { Badge } from "@/components/ui/badge";

interface TeamSettingsTabProps {
  team?: Team;
  subscription?: Subscription | null;
}

export function TeamSettingsTab({ team, subscription }: TeamSettingsTabProps) {
  const { currentTeam } = useTeam();
  const { session } = useAuth();
  const { can } = usePermission();
  const [name, setName] = useState(currentTeam?.team.name || "");
  const [isLoading, setIsLoading] = useState(false);

  // Mocked states for new settings
  const [emailDigest, setEmailDigest] = useState(true);

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
      notify.success("Configurações atualizadas com sucesso!");
      // Atualiza o contexto global do time
      window.location.reload();
    } catch (error: any) {
      notify.error(error, "atualizar a equipe");
    } finally {
      setIsLoading(false);
    }
  };

  const isPro = team?.isPro(!!subscription && subscription.isActive());

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* AI Powered Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Inteligência Artificial
            </h3>
            <p className="text-sm text-muted-foreground">
              Potencialize sua gestão financeira com nossos recursos de IA
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card
            className={`relative overflow-hidden border-primary/20 transition-all duration-300 hover:shadow-lg ${
              !isPro
                ? "bg-muted/30"
                : "bg-gradient-to-br from-primary/5 to-transparent"
            }`}
          >
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Bot className="w-24 h-24" />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-primary/10 rounded-lg w-fit">
                  <BrainCircuit className="w-6 h-6 text-primary" />
                </div>
                {!isPro && (
                  <Badge
                    variant="outline"
                    className="border-primary/50 text-primary"
                  >
                    PRO
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl">Leitura de Recibos</CardTitle>
              <CardDescription>
                Automação inteligente para seus documentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Nossa IA analisa fotos de recibos e extrai automaticamente data,
                valor e categoria, eliminando a digitação manual e reduzindo
                erros.
              </p>
            </CardContent>
          </Card>

          <Card
            className={`relative overflow-hidden border-amber-500/20 transition-all duration-300 hover:shadow-lg ${
              !isPro
                ? "bg-muted/30"
                : "bg-gradient-to-br from-amber-500/5 to-transparent"
            }`}
          >
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Zap className="w-24 h-24" />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-amber-500/10 rounded-lg w-fit">
                  <LineChart className="w-6 h-6 text-amber-600" />
                </div>
                {!isPro && (
                  <Badge
                    variant="outline"
                    className="border-amber-500/50 text-amber-600"
                  >
                    PRO
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl">Insights Financeiros</CardTitle>
              <CardDescription>
                Análise preditiva e detecção de anomalias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Receba alertas proativos sobre gastos incomuns, previsões de
                fluxo de caixa e sugestões personalizadas de economia baseadas
                no seu histórico.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* General Settings */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="p-2 bg-muted rounded-lg">
            <Save className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Geral</h3>
            <p className="text-sm text-muted-foreground">
              Informações básicas e preferências da equipe
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleUpdateTeam} className="space-y-6 max-w-2xl">
              <div className="space-y-4">
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
                  <p className="text-xs text-muted-foreground">
                    Este é o nome visível para todos os membros da equipe.
                  </p>
                </div>

                <div className="flex items-center justify-between border rounded-lg p-4">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="digest"
                      className="text-base flex items-center gap-2"
                    >
                      <Bell className="w-4 h-4 text-muted-foreground" />
                      Resumo Semanal
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receba um relatório de atividades por email toda
                      segunda-feira.
                    </p>
                  </div>
                  <Switch
                    id="digest"
                    checked={emailDigest}
                    onCheckedChange={setEmailDigest}
                    disabled={!can("MANAGE_TEAM")}
                  />
                </div>
              </div>

              {can("MANAGE_TEAM") && (
                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Salvar Alterações
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
