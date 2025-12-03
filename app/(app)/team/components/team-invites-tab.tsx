"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, X, Loader2 } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useTeam } from "@/app/(app)/team/team-provider";
import { usePermission } from "@/hooks/use-permission";
import { notify } from "@/lib/notify-helper";
import { manageMembersUseCase } from "@/infrastructure/dependency-injection";
import type { TeamInvite } from "@/domain/entities/team-invite";

interface TeamInvitesTabProps {
  invites: TeamInvite[];
  onUpdate: () => Promise<void>;
}

export function TeamInvitesTab({ invites, onUpdate }: TeamInvitesTabProps) {
  const { currentTeam } = useTeam();
  const { session } = useAuth();
  const { can } = usePermission();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleCancelInvite = async (inviteId: string) => {
    if (!currentTeam || !session?.user) return;
    setLoadingId(inviteId);
    try {
      await manageMembersUseCase.cancelInvite(
        inviteId,
        currentTeam.team.id,
        session.user.id
      );
      notify.success("Convite cancelado");
      await onUpdate();
    } catch (error: unknown) {
      notify.error(error, "cancelar o convite");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Convites Pendentes
        </h3>
        <p className="text-sm text-muted-foreground">
          Gerencie os convites enviados que ainda não foram aceitos.
        </p>
      </div>

      {invites.length === 0 ? (
        <Card className="border-dashed bg-muted/30">
          <CardContent className="py-12 flex flex-col items-center text-center text-muted-foreground">
            <div className="bg-muted p-4 rounded-full mb-3">
              <Mail className="h-6 w-6 opacity-50" />
            </div>
            <p className="font-medium">Nenhum convite pendente</p>
            <p className="text-sm mt-1">
              Convide novos membros na aba "Membros".
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {invites.map((invite) => (
            <Card key={invite.id} className="overflow-hidden">
              <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {invite.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs font-normal">
                        Enviado em{" "}
                        {new Date(invite.createdAt).toLocaleDateString()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        por{" "}
                        {(invite as unknown as { invitedByName: string })
                          .invitedByName || "Alguém"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200"
                  >
                    Aguardando
                  </Badge>
                  {can("MANAGE_TEAM") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-red-600 hover:bg-red-50 ml-auto sm:ml-0"
                      onClick={() => handleCancelInvite(invite.id)}
                      disabled={loadingId === invite.id}
                    >
                      {loadingId === invite.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <X className="w-4 h-4 mr-2" /> Cancelar
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
