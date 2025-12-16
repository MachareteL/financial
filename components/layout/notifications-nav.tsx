"use client";

import { useState, useEffect } from "react";
import { Bell, Check, X, Sparkles, Mail, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/components/providers/auth-provider";
import {
  getPendingInvitesUseCase,
  acceptInviteUseCase,
  declineInviteUseCase,
} from "@/infrastructure/dependency-injection";
import type { TeamInviteDetailsDTO } from "@/domain/dto/team.types";
import { notify } from "@/lib/notify-helper";
import { Badge } from "@/components/ui/badge";

// import { useParams } from "next/navigation"; // Removed
import { useInsights } from "@/hooks/use-insights";

export function NotificationsNav() {
  const { session } = useAuth();
  const [invites, setInvites] = useState<TeamInviteDetailsDTO[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  // const params = useParams(); // Removed
  // const teamId = typeof params?.teamId === "string" ? params.teamId : undefined; // Removed

  const { insights, markAsRead } = useInsights();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, session?.user?.email]);

  // Initial fetch to show badge count
  useEffect(() => {
    fetchInvites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email]);

  const handleAccept = async (inviteId: string) => {
    if (!session?.user?.id) return;
    try {
      await acceptInviteUseCase.execute(inviteId, session.user.id);
      notify.success("Convite aceito com sucesso!");
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
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

  const hasNotifications = invites.length > 0 || insights.length > 0;
  const notificationCount = invites.length + insights.length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
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
                            {(invite as unknown as { teamName: string })
                              .teamName || "Time"}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Convidado por{" "}
                          {(invite as unknown as { invitedByName: string })
                            .invitedByName || "Alguém"}
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
              <div className="flex items-center justify-between mb-3 mt-2">
                <h5 className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-yellow-500" /> Insights IA
                </h5>
              </div>

              <div className="space-y-3">
                {insights.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-muted-foreground/50" />
                    </div>
                    <p className="text-xs text-muted-foreground max-w-[200px]">
                      Seus insights semanais aparecerão aqui automaticamente.
                    </p>
                  </div>
                )}

                {insights.map((insight) => (
                  <div
                    key={insight.id}
                    className="group relative p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(insight.id);
                        }}
                        title="Marcar como lido"
                      >
                        <span className="sr-only">Ocultar</span>
                        <EyeOff className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex items-start gap-3 pr-6">
                      <div className="mt-0.5">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {insight.title}
                        </p>
                        <div className="text-xs text-muted-foreground leading-relaxed">
                          {insight.content}
                        </div>
                        <p className="text-[10px] text-muted-foreground pt-1">
                          {new Date(insight.createdAt).toLocaleDateString()}
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
