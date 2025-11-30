"use client";

import { useState, useEffect } from "react";
import { Bell, Check, X, Sparkles, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/app/auth/auth-provider";
import {
  getPendingInvitesUseCase,
  acceptInviteUseCase,
  declineInviteUseCase,
} from "@/infrastructure/dependency-injection";
import type { TeamInviteDetailsDTO } from "@/domain/dto/team.types";
import { notify } from "@/lib/notify-helper";
import { Badge } from "@/components/ui/badge";

export function NotificationsNav() {
  const { session } = useAuth();
  const [invites, setInvites] = useState<TeamInviteDetailsDTO[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchInvites = async () => {
    if (!session?.user?.email) return;
    try {
      const data = await getPendingInvitesUseCase.execute(session.user.email);
      setInvites(data);
    } catch (error) {
      notify.error(error, "carregar convites");
      console.error("Failed to fetch invites", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInvites();
    }
  }, [isOpen, session?.user?.email]);

  // Initial fetch to show badge count
  useEffect(() => {
    fetchInvites();
  }, [session?.user?.email]);

  const handleAccept = async (inviteId: string) => {
    if (!session?.user?.id) return;
    try {
      await acceptInviteUseCase.execute(inviteId, session.user.id);
      notify.success("Convite aceito com sucesso!");
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
      // Opcional: Recarregar a página ou atualizar contexto de times
      window.location.reload();
    } catch (error) {
      notify.error(error, "aceitar convite");
    }
  };

  const handleDecline = async (inviteId: string) => {
    try {
      await declineInviteUseCase.execute(inviteId);
      notify.success("Convite recusado.");
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
    } catch (error) {
      notify.error(error, "recusar convite");
    }
  };

  // Mocked AI Insights
  const insights = [
    {
      id: "1",
      title: "Economia em Alimentação",
      description:
        "Você gastou 15% a menos em restaurantes esta semana comparado à média.",
      type: "positive",
    },
    {
      id: "2",
      title: "Meta de Viagem",
      description:
        "Sua meta 'Férias 2024' atingiu 50% do objetivo. Continue assim!",
      type: "info",
    },
  ];

  const hasNotifications = invites.length > 0 || insights.length > 0;
  const notificationCount = invites.length + insights.length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {invites.length > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 ring-2 ring-background" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold text-sm">Notificações</h4>
          {notificationCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {notificationCount} novas
            </Badge>
          )}
        </div>
        <div className="h-[400px] overflow-y-auto">
          <div className="flex flex-col">
            {/* Invites Section */}
            {invites.length > 0 && (
              <div className="p-4 pb-2">
                <h5 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Mail className="h-3 w-3" /> Convites de Time
                </h5>
                <div className="space-y-3">
                  {invites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex flex-col gap-3 p-3 rounded-lg bg-muted/50 border"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          Convite para{" "}
                          <span className="text-primary">
                            {(invite as any).teamName || "Time"}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Convidado por{" "}
                          {(invite as any).invitedByName || "Alguém"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="w-full h-8 text-xs"
                          onClick={() => handleAccept(invite.id)}
                        >
                          <Check className="h-3 w-3 mr-1.5" /> Aceitar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full h-8 text-xs"
                          onClick={() => handleDecline(invite.id)}
                        >
                          <X className="h-3 w-3 mr-1.5" /> Recusar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {invites.length > 0 && insights.length > 0 && (
              <div className="h-[1px] w-full bg-border" />
            )}

            {/* Insights Section */}
            <div className="p-4 pt-2">
              <h5 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2 mt-2">
                <Sparkles className="h-3 w-3 text-yellow-500" /> Insights IA
              </h5>
              <div className="space-y-3">
                {insights.map((insight) => (
                  <div
                    key={insight.id}
                    className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-default"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {insight.title}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {!hasNotifications && (
              <div className="p-8 text-center text-muted-foreground">
                <p className="text-sm">Nenhuma notificação nova.</p>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
