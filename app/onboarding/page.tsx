"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  UserPlus,
  Moon,
  Sun,
  RefreshCw,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { createTeamUseCase } from "@/infrastructure/dependency-injection";
import { notify } from "@/lib/notify-helper";
import {
  usePendingInvites,
  useAcceptInvite,
  useDeclineInvite,
} from "@/hooks/use-invites";
import { LoadingState } from "@/components/lemon/loading-state";

export default function OnboardingPage() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // React Query Hooks
  const {
    data: invites = [],
    isLoading: loadingInvites,
    refetch: refetchInvites,
    isRefetching: isRefetchingInvites,
  } = usePendingInvites(session?.user?.email);

  const acceptInviteMutation = useAcceptInvite();
  const declineInviteMutation = useDeclineInvite();

  const [isLoading, setIsLoading] = useState(false);
  const [teamName, setTeamName] = useState("");

  const actionLoading =
    acceptInviteMutation.isPending || declineInviteMutation.isPending;

  // useEffect(() => {
  //   // Auth check is handled by middleware
  //   if (session?.teams && session.teams.length > 0) {
  //     router.push("/dashboard");
  //   }
  // }, [session, loading, router]);

  const handleCreateTeam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!session?.user) return;

    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const teamName = formData.get("teamName") as string;

    try {
      await createTeamUseCase.execute({
        teamName,
        userId: session.user.id,
      });

      notify.success("Equipe criada com sucesso!", {
        description: `A equipe "${teamName}" foi criada.`,
      });

      // Força recarregamento da sessão para atualizar os times
      window.location.reload();
    } catch (error: unknown) {
      notify.error(error, "criar a equipe");
      setIsLoading(false);
    }
  };

  const handleAcceptInvite = async (inviteId: string) => {
    if (!session?.user) return;
    try {
      await acceptInviteMutation.mutateAsync({
        inviteId,
        userId: session.user.id,
      });
      notify.success("Convite aceito!", {
        description: "Você entrou para a equipe.",
      });
      // Força recarregamento da sessão
      window.location.reload();
    } catch (error: unknown) {
      notify.error(error, "aceitar convite");
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    try {
      await declineInviteMutation.mutateAsync(inviteId);
      notify.success("Convite recusado.");
    } catch (error: unknown) {
      notify.error(error, "recusar convite");
    }
  };

  const handleRefreshInvites = async () => {
    await refetchInvites();
    notify.success("Lista de convites atualizada.");
  };

  if (loading || !session) {
    return <LoadingState message="Carregando suas informações..." />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 transition-colors duration-300">
      <div className="max-w-5xl w-full space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">
            Bem-vindo ao Lemon, {session.user.name?.split(" ")[0]}!
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Estamos felizes em ter você aqui. Para começar a organizar suas
            finanças, precisamos configurar seu espaço de trabalho.
          </p>
        </div>

        {/* Theme Selection - Subtle but accessible */}
        <div className="flex justify-center gap-2">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("light")}
            className="rounded-full px-4"
          >
            <Sun className="w-4 h-4 mr-2" />
            Claro
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("dark")}
            className="rounded-full px-4"
          >
            <Moon className="w-4 h-4 mr-2" />
            Escuro
          </Button>
        </div>

        {/* AI Value Proposition Section */}
        <Card className="bg-gradient-to-r from-primary/10 via-background to-background border-primary/20">
          <CardContent className="flex items-center gap-6 p-6">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                Potencialize suas finanças
                <Badge variant="secondary" className="text-xs font-normal">
                  Beta
                </Badge>
              </h3>
              <p className="text-muted-foreground">
                Com o Lemon AI, você pode gerar{" "}
                <strong>insights inteligentes</strong>. Descubra padrões,
                oportunidades de economia e tenha uma visão clara do seu
                dinheiro, tudo no seu tempo e sob seu controle.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Actions */}
          <div className="space-y-6">
            {/* Create Team */}
            <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-primary" />
                  Criar Nova Equipe
                </CardTitle>
                <CardDescription>
                  Crie um espaço para você ou sua família.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTeam} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="teamName">Nome da Equipe</Label>
                    <Input
                      id="teamName"
                      name="teamName"
                      placeholder="Ex: Minha Casa, Família Silva..."
                      required
                      disabled={isLoading}
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? "Criando..." : "Começar Agora"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Invites */}
            <Card className="border-border shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-base font-medium">
                    Convites Pendentes
                  </CardTitle>
                  <CardDescription>
                    Verifique se você foi convidado.
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshInvites}
                  disabled={loadingInvites || isRefetchingInvites}
                  className="gap-2 text-muted-foreground hover:text-primary border border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${
                      loadingInvites || isRefetchingInvites
                        ? "animate-spin"
                        : ""
                    }`}
                  />
                  Atualizar convites
                </Button>
              </CardHeader>
              <CardContent className="pt-4">
                {loadingInvites && !isRefetchingInvites ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    Buscando convites...
                  </div>
                ) : invites.length > 0 ? (
                  <div className="space-y-3">
                    {invites.map((invite) => (
                      <div
                        key={invite.id}
                        className="bg-muted/30 border rounded-lg p-3 flex flex-col gap-3 transition-colors hover:bg-muted/50"
                      >
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            {
                              (invite as unknown as { teamName: string })
                                .teamName
                            }
                          </p>
                          <p className="text-xs text-muted-foreground">
                            De:{" "}
                            {
                              (invite as unknown as { invitedByName: string })
                                .invitedByName
                            }
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 h-8 text-xs"
                            onClick={() => handleAcceptInvite(invite.id)}
                            disabled={actionLoading}
                          >
                            Aceitar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8 text-xs text-destructive hover:text-destructive"
                            onClick={() => handleDeclineInvite(invite.id)}
                            disabled={actionLoading}
                          >
                            Recusar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-muted/20 rounded-lg border border-dashed">
                    <p className="text-sm text-muted-foreground mb-1">
                      Nenhum convite encontrado.
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Seu email é:{" "}
                      <span className="font-medium text-foreground">
                        {session.user.email}
                      </span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Explanations */}
          <div className="space-y-6 lg:pt-0">
            <Card className="bg-primary/5 border-primary/10 shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Users className="w-5 h-5" />
                  Como o Lemon funciona?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-background border border-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-bold shadow-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      Crie sua Equipe
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Comece criando um espaço para suas finanças. Pode ser
                      pessoal, para o casal ou para toda a família. Você define
                      quem participa.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-background border border-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-bold shadow-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      Organize Gastos e Metas
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Registre despesas, categorize gastos e defina metas de
                      economia. Tudo fica sincronizado para todos os membros da
                      equipe.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-background border border-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-bold shadow-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      Acompanhe a Evolução
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Visualize para onde seu dinheiro está indo com relatórios
                      simples e tome decisões melhores para o seu futuro
                      financeiro.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-muted/30 rounded-lg p-4 border flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-foreground">
                  Dica Rápida
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Você pode criar múltiplas equipes depois (ex: uma para "Casa"
                  e outra para "Pessoal") no menu de configurações.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
