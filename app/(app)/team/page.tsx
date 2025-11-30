"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Mail,
  Loader2,
  Users,
  ShieldCheck,
  Settings,
  Sparkles,
} from "lucide-react";
import { useTeam } from "@/app/(app)/team/team-provider";
import { notify } from "@/lib/notify-helper";

// DTOs e Entidades
import type { TeamMemberProfileDTO } from "@/domain/dto/team.types.d.ts";
import type { TeamRole } from "@/domain/entities/team-role";
import type { TeamInvite } from "@/domain/entities/team-invite";

// Casos de Uso
import { getTeamDataUseCase } from "@/infrastructure/dependency-injection";

// Componentes
import { TeamMembersTab } from "./components/team-members-tab";
import { TeamRolesTab } from "./components/team-roles-tab";
import { TeamSettingsTab } from "./components/team-settings-tab";
import { TeamInvitesTab } from "./components/team-invites-tab";
import { TeamSubscriptionTab } from "./components/team-subscription-tab";

import type { Subscription } from "@/domain/entities/subscription";
import type { Team } from "@/domain/entities/team";

export default function TeamPage() {
  const { currentTeam } = useTeam();
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

  if (!currentTeam || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto" />
      </div>
    );
  }

  const isPro = teamDetails?.isPro(!!subscription && subscription.isActive());

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
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {currentTeam.team.name}
                </h1>
                {isPro ? (
                  <Badge className="bg-gradient-to-r from-primary to-purple-600 border-0 text-primary-foreground shadow-sm">
                    <Sparkles className="w-3 h-3 mr-1" /> PRO
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-muted-foreground">
                    Free
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie membros, cargos e configurações da equipe.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <Tabs defaultValue="members" className="w-full space-y-6">
          <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0">
            <TabsList className="inline-flex w-auto min-w-full sm:w-auto bg-muted/50 p-1">
              <TabsTrigger value="members" className="text-xs sm:text-sm px-4">
                <Users className="w-4 h-4 mr-2 hidden sm:inline-block" />
                Membros
              </TabsTrigger>
              <TabsTrigger value="roles" className="text-xs sm:text-sm px-4">
                <ShieldCheck className="w-4 h-4 mr-2 hidden sm:inline-block" />
                Cargos
              </TabsTrigger>
              <TabsTrigger value="invites" className="text-xs sm:text-sm px-4">
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
              <TabsTrigger
                value="subscription"
                className="text-xs sm:text-sm px-4"
              >
                <Sparkles className="w-4 h-4 mr-2 hidden sm:inline-block" />
                Assinatura
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs sm:text-sm px-4">
                <Settings className="w-4 h-4 mr-2 hidden sm:inline-block" />
                Configurações
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="members" className="outline-none mt-0">
            <TeamMembersTab
              members={members}
              roles={roles}
              onUpdate={loadTeamData}
            />
          </TabsContent>
          <TabsContent value="roles" className="outline-none mt-0">
            <TeamRolesTab roles={roles} onUpdate={loadTeamData} />
          </TabsContent>
          <TabsContent value="invites" className="outline-none mt-0">
            <TeamInvitesTab invites={invites} onUpdate={loadTeamData} />
          </TabsContent>
          <TabsContent value="subscription" className="outline-none mt-0">
            {teamDetails && (
              <TeamSubscriptionTab
                team={teamDetails}
                subscription={subscription}
              />
            )}
          </TabsContent>
          <TabsContent value="settings" className="outline-none mt-0">
            {teamDetails && (
              <TeamSettingsTab team={teamDetails} subscription={subscription} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
