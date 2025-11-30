"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getPendingInvitesUseCase,
  acceptInviteUseCase,
  declineInviteUseCase,
} from "@/infrastructure/dependency-injection";
import { useAuth } from "@/app/auth/auth-provider";
import { notify } from "@/lib/notify-helper";
import type { TeamInviteDetailsDTO } from "@/domain/dto/team.types.d.ts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserPlus, Mail } from "lucide-react";

export default function InvitesPage() {
  const { session } = useAuth();
  const [invites, setInvites] = useState<TeamInviteDetailsDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchInvites = async () => {
      if (!session?.user?.email) return;
      try {
        const data = await getPendingInvitesUseCase.execute(session.user.email);
        setInvites(data);
      } catch (error) {
        console.error("Erro ao buscar convites:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvites();
  }, [session]);

  const handleAcceptInvite = async (inviteId: string) => {
    if (!session?.user) return;
    setActionLoading(true);
    try {
      await acceptInviteUseCase.execute(inviteId, session.user.id);
      notify.success("Convite aceito!", {
        description: "Você entrou para a equipe.",
      });
      // Recarrega a página para atualizar a sessão e os times
      router.refresh();
    } catch (error: any) {
      notify.error(error, "aceitar convite");
      setActionLoading(false);
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    setActionLoading(true);
    try {
      await declineInviteUseCase.execute(inviteId);
      notify.success("Convite recusado.");
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
    } catch (error: any) {
      notify.error(error, "recusar convite");
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Convites</h1>
        <p className="text-muted-foreground">
          Gerencie seus convites para entrar em outras equipes.
        </p>
      </div>

      {invites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted/50 p-4 rounded-full mb-4">
              <Mail className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Nenhum convite pendente</h3>
            <p className="text-muted-foreground max-w-sm mt-2">
              Você não tem convites pendentes no momento. Quando alguém te
              convidar, aparecerá aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {invites.map((invite) => (
            <Card key={invite.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-full">
                    <UserPlus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 rounded-full">
                    Pendente
                  </span>
                </div>
                <CardTitle>{invite.teamName}</CardTitle>
                <CardDescription>
                  Convidado por {invite.invitedByName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Cargo: </span>
                    <span className="font-medium">{invite.roleName}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleAcceptInvite(invite.id)}
                      disabled={actionLoading}
                    >
                      Aceitar
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleDeclineInvite(invite.id)}
                      disabled={actionLoading}
                    >
                      Recusar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
