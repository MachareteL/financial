"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { notify } from "@/lib/notify-helper";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserPlus, Mail, Loader2 } from "lucide-react";
import {
  usePendingInvites,
  useAcceptInvite,
  useDeclineInvite,
} from "@/hooks/use-invites";
import { LoadingState } from "@/components/lemon/loading-state";

export default function InvitesPage() {
  const { session } = useAuth();
  const router = useRouter();

  // React Query Hooks
  const { data: invites = [], isLoading } = usePendingInvites(
    session?.user?.email
  );
  const acceptInviteMutation = useAcceptInvite();
  const declineInviteMutation = useDeclineInvite();

  const isActionLoading =
    acceptInviteMutation.isPending || declineInviteMutation.isPending;

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
      // Recarrega a página para atualizar a sessão e os times completamente
      router.refresh();
      // Opcional: Forçar reload da janela se o router.refresh não atualizar o contexto de Auth imediatamente
      // window.location.reload();
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

  if (isLoading) {
    return <LoadingState message="Buscando convites..." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
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
            <Card key={invite.id} className="transition-all hover:shadow-md">
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
                      disabled={isActionLoading}
                    >
                      {acceptInviteMutation.isPending &&
                      acceptInviteMutation.variables?.inviteId === invite.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        "Aceitar"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleDeclineInvite(invite.id)}
                      disabled={isActionLoading}
                    >
                      {declineInviteMutation.isPending &&
                      declineInviteMutation.variables === invite.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        "Recusar"
                      )}
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
