"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Users, UserPlus } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { createTeamUseCase } from "@/infrastructure/dependency-injection";
import { notify } from "@/lib/notify-helper";
import {
  usePendingInvites,
  useAcceptInvite,
  useDeclineInvite,
} from "@/hooks/use-invites";

export default function OnboardingPage() {
  const { session, loading } = useAuth();
  const router = useRouter();

  // React Query Hooks
  const { data: invites = [], isLoading: loadingInvites } = usePendingInvites(
    session?.user?.email
  );
  const acceptInviteMutation = useAcceptInvite();
  const declineInviteMutation = useDeclineInvite();

  const [isLoading, setIsLoading] = useState(false);
  const [teamName, setTeamName] = useState("");

  const actionLoading =
    acceptInviteMutation.isPending || declineInviteMutation.isPending;

  useEffect(() => {
    // Auth check is handled by middleware
    if (session?.teams && session.teams.length > 0) {
      router.push("/dashboard");
    }
  }, [session, loading, router]);

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

  if (loading || !session || (session.teams && session.teams.length > 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-foreground">
            Carregando...
          </h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bem-vindo, {session.user.name}!
          </h1>
          <p className="text-muted-foreground">
            Para começar, você precisa criar um time/equipe ou ser convidado
            para um(a).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Criar Time */}
          <Card className="h-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <UserPlus className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Criar Nova equipe</CardTitle>
              <CardDescription>
                Comece um novo time financeiro e convide outros membros depois
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName">Nome do Time</Label>
                  <Input
                    id="teamName"
                    name="teamName"
                    placeholder="Ex: Família Silva"
                    required
                    disabled={isLoading}
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Criando..." : "Criar Equipe"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Convites */}
          <Card className="h-full flex flex-col">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <UserPlus className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Convites Pendentes</CardTitle>
              <CardDescription>
                Veja se alguém te convidou para um time
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {loadingInvites ? (
                <div className="text-center py-4 text-muted-foreground">
                  Carregando convites...
                </div>
              ) : invites.length > 0 ? (
                <div className="space-y-4">
                  {invites.map((invite) => (
                    <div
                      key={invite.id}
                      className="bg-card border rounded-lg p-4 shadow-sm flex flex-col gap-3"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          Time:{" "}
                          {(invite as unknown as { teamName: string }).teamName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Convidado por:{" "}
                          {
                            (invite as unknown as { invitedByName: string })
                              .invitedByName
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Cargo:{" "}
                          {(invite as unknown as { roleName: string }).roleName}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                          onClick={() => handleAcceptInvite(invite.id)}
                          disabled={actionLoading}
                        >
                          Aceitar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
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
                <div className="text-center space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      Seu email para convite:
                    </p>
                    <p className="font-medium text-foreground">
                      {session.user.email}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Nenhum convite pendente no momento.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Como funciona
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">1</span>
              </div>
              <div>
                <h4 className="font-medium">
                  Cada pessoa tem um Time ou uma Equipe
                </h4>
                <p className="text-sm text-muted-foreground">
                  Um "time" é o espaço compartilhado onde vocês organizam a vida
                  financeira em conjunto.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
