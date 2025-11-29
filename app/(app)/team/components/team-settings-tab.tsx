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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Save,
  Bot,
  Sparkles,
  Zap,
  Globe,
  Bell,
  DollarSign,
} from "lucide-react";
import { useTeam } from "@/app/(app)/team/team-provider";
import { notify } from "@/lib/notify-helper";
import { updateTeamUseCase } from "@/infrastructure/dependency-injection";
import { useAuth } from "@/app/auth/auth-provider";
import { usePermission } from "@/hooks/use-permission";
import { TeamBillingSection } from "./team-billing-section";
import type { Subscription } from "@/domain/entities/subscription";
import type { Team } from "@/domain/entities/team";

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
  const [currency, setCurrency] = useState("BRL");
  const [timezone, setTimezone] = useState("America/Sao_Paulo");
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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* AI Powered Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Powered</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card
            className={`border-indigo-100 bg-indigo-50/50 ${
              !isPro ? "opacity-75 grayscale" : ""
            }`}
          >
            <CardHeader className="pb-2">
              <Bot className="w-8 h-8 text-indigo-600 mb-2" />
              <CardTitle className="text-base">Leitura de Recibos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Extraia automaticamente data, valor e categoria de fotos de
                recibos.
              </p>
              {!isPro && (
                <div className="mt-3 text-xs font-medium text-indigo-600 bg-indigo-100 inline-block px-2 py-1 rounded">
                  Disponível no PRO
                </div>
              )}
            </CardContent>
          </Card>

          <Card
            className={`border-indigo-100 bg-indigo-50/50 ${
              !isPro ? "opacity-75 grayscale" : ""
            }`}
          >
            <CardHeader className="pb-2">
              <Zap className="w-8 h-8 text-amber-500 mb-2" />
              <CardTitle className="text-base">Insights Inteligentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Receba alertas sobre gastos anômalos e oportunidades de
                economia.
              </p>
              {!isPro && (
                <div className="mt-3 text-xs font-medium text-indigo-600 bg-indigo-100 inline-block px-2 py-1 rounded">
                  Disponível no PRO
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* General Settings */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Geral</h3>
        <Card>
          <CardHeader>
            <CardTitle>Preferências da Equipe</CardTitle>
            <CardDescription>
              Personalize como sua equipe opera.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateTeam} className="space-y-6 max-w-2xl">
              <div className="grid gap-6 md:grid-cols-2">
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    Moeda Padrão
                  </Label>
                  <Select
                    value={currency}
                    onValueChange={setCurrency}
                    disabled={!can("MANAGE_TEAM")}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Selecione a moeda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">Real Brasileiro (BRL)</SelectItem>
                      <SelectItem value="USD">Dólar Americano (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone" className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    Fuso Horário
                  </Label>
                  <Select
                    value={timezone}
                    onValueChange={setTimezone}
                    disabled={!can("MANAGE_TEAM")}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Selecione o fuso" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">
                        Brasília (GMT-3)
                      </SelectItem>
                      <SelectItem value="America/New_York">
                        Nova York (GMT-5)
                      </SelectItem>
                      <SelectItem value="Europe/London">
                        Londres (GMT+0)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 flex flex-col justify-end pb-2">
                  <div className="flex items-center justify-between border rounded-lg p-3">
                    <div className="space-y-0.5">
                      <Label
                        htmlFor="digest"
                        className="text-base flex items-center gap-2"
                      >
                        <Bell className="w-4 h-4 text-muted-foreground" />
                        Resumo Semanal
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Receba um resumo por email.
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
              </div>

              {can("MANAGE_TEAM") && (
                <div className="flex justify-end pt-4 border-t">
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

      {/* Billing Section */}
      {team && (
        <section className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-semibold text-gray-900">
            Assinatura e Cobrança
          </h3>
          <TeamBillingSection team={team} subscription={subscription || null} />
        </section>
      )}
    </div>
  );
}
