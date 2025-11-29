"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Mail,
  Loader2,
  X,
  Users,
  ShieldCheck,
  Settings,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/app/auth/auth-provider";
import { useTeam } from "@/app/(app)/team/team-provider";
import { usePermission } from "@/hooks/use-permission";
import { notify } from "@/lib/notify-helper";

// DTOs e Entidades
import type { TeamMemberProfileDTO } from "@/domain/dto/team.types.d.ts";
import type { TeamRole } from "@/domain/entities/team-role";
import type { TeamInvite } from "@/domain/entities/team-invite";

// Casos de Uso
import {
  getTeamDataUseCase,
  manageMembersUseCase,
} from "@/infrastructure/dependency-injection";

// Componentes
import { TeamMembersTab } from "./components/team-members-tab";
import { TeamRolesTab } from "./components/team-roles-tab";
import { TeamSettingsTab } from "./components/team-settings-tab";
import { TeamSubscriptionTab } from "./components/team-subscription-tab";

import type { Subscription } from "@/domain/entities/subscription";
import type { Team } from "@/domain/entities/team";

export default function TeamPage() {
  const { currentTeam } = useTeam();
  const { can } = usePermission();
  const router = useRouter();

  // Dados
  const [members, setMembers] = useState<TeamMemberProfileDTO[]>([]);
  const [roles, setRoles] = useState<TeamRole[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [teamDetails, setTeamDetails] = useState<Team | null>(null);

  // Estados de UI
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados ao entrar ou trocar de time
  useEffect(() => {
    if (currentTeam) loadTeamData();
  }, [currentTeam]);

  const loadTeamData = async () => {
    if (!currentTeam) return;
    setIsLoading(true);
    try {
      const data = await getTeamDataUseCase.execute(currentTeam.team.id);
      setMembers(data.members);
      setRoles(data.roles);
      setInvites(data.invites);
      setSubscription(data.subscription);
      setTeamDetails(data.team);
    } catch (error: any) {
      notify.error(error, "carregar os dados da equipe");
    } finally {
      setIsLoading(false);
    }
  };

  const { session } = useAuth();

  const handleCancelInvite = async (inviteId: string) => {
    if (!currentTeam || !session?.user) return;
    try {
      await manageMembersUseCase.cancelInvite(
        inviteId,
        currentTeam.team.id,
        session.user.id
      );
      notify.success("Convite cancelado");
      await loadTeamData();
    } catch (error: any) {
      notify.error(error, "cancelar o convite");
    }
  };

  if (!currentTeam || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/dashboard")}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {currentTeam.team.name}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie membros, cargos e configurações da equipe.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <Tabs defaultValue="members" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px] bg-muted/50 p-1">
            <TabsTrigger value="members" className="text-xs sm:text-sm">
              <Users className="w-4 h-4 mr-2 hidden sm:inline-block" />
              Membros
            </TabsTrigger>
            <TabsTrigger value="roles" className="text-xs sm:text-sm">
              <ShieldCheck className="w-4 h-4 mr-2 hidden sm:inline-block" />
              Cargos
            </TabsTrigger>
            <TabsTrigger value="invites" className="text-xs sm:text-sm">
              <Mail className="w-4 h-4 mr-2 hidden sm:inline-block" />
              Convites
              {invites.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 h-5 px-1.5 text-[10px]"
                >
                  {invites.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm">
              <Settings className="w-4 h-4 mr-2 hidden sm:inline-block" />
              Configurações
            </TabsTrigger>
            <TabsTrigger value="subscription" className="text-xs sm:text-sm">
              <CreditCard className="w-4 h-4 mr-2 hidden sm:inline-block" />
              Assinatura
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="outline-none">
            <TeamMembersTab
              members={members}
              roles={roles}
              onUpdate={loadTeamData}
            />
          </TabsContent>

          <TabsContent value="roles" className="outline-none">
            <TeamRolesTab roles={roles} onUpdate={loadTeamData} />
          </TabsContent>

          <TabsContent
            value="invites"
            className="outline-none space-y-6 animate-in fade-in duration-500"
          >
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
                            <Badge
                              variant="outline"
                              className="text-xs font-normal"
                            >
                              Enviado em{" "}
                              {new Date(invite.createdAt).toLocaleDateString()}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              por {(invite as any).invitedByName || "Alguém"}
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
                          >
                            <X className="w-4 h-4 mr-2" /> Cancelar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="outline-none">
            <TeamSettingsTab />
          </TabsContent>

          <TabsContent value="subscription" className="outline-none">
            {teamDetails && (
              <TeamSubscriptionTab
                team={teamDetails}
                subscription={subscription}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
