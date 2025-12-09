"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Mail,
  Users,
  ShieldCheck,
  Settings,
  Sparkles,
} from "lucide-react";
import { LoadingState } from "@/components/lemon/loading-state";
import { useTeam } from "@/app/(app)/team/team-provider";
import { useTeamData } from "@/hooks/use-team-data";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

// Componentes
import { TeamMembersTab } from "./components/team-members-tab";
import { TeamRolesTab } from "./components/team-roles-tab";
import { TeamSettingsTab } from "./components/team-settings-tab";
import { TeamInvitesTab } from "./components/team-invites-tab";
import { TeamSubscriptionTab } from "./components/team-subscription-tab";

function TeamContent() {
  const { currentTeam } = useTeam();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPolling, setIsPolling] = useState(false);

  // React Query Hook
  const {
    data: teamData,
    isLoading,
    refetch,
  } = useTeamData(currentTeam?.team.id);

  const members = teamData?.members || [];
  const roles = teamData?.roles || [];
  const invites = teamData?.invites || [];
  const subscription = teamData?.subscription || null;
  const teamDetails = teamData?.team || null;

  const handleUpdate = async () => {
    await refetch();
  };

  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true" && !isPolling) {
      setIsPolling(true);
      toast.loading("Confirmando sua assinatura...", {
        id: "sub-check",
        duration: 10000,
      });

      // Poll every 2 seconds for 10 seconds or until subscription appears
      const interval = setInterval(async () => {
        const { data } = await refetch();
        if (data?.subscription) {
          toast.dismiss("sub-check");
          toast.success("Tudo certo! Sua assinatura está confirmada.");
          setIsPolling(false);
          clearInterval(interval);
          // Clean URL
          router.replace("/team");
        }
      }, 2000);

      // Stop polling after 15 seconds max
      setTimeout(() => {
        clearInterval(interval);
        setIsPolling(false);
        toast.dismiss("sub-check");
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [searchParams, refetch, router, isPolling]);

  if (!currentTeam || isLoading) {
    return <LoadingState message="Carregando equipe..." />;
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
                  <Badge className="bg-primary text-primary-foreground shadow-sm border-0">
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
              onUpdate={handleUpdate}
            />
          </TabsContent>
          <TabsContent value="roles" className="outline-none mt-0">
            <TeamRolesTab roles={roles} onUpdate={handleUpdate} />
          </TabsContent>
          <TabsContent value="invites" className="outline-none mt-0">
            <TeamInvitesTab invites={invites} onUpdate={handleUpdate} />
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

export default function TeamPage() {
  return (
    <Suspense fallback={<LoadingState message="Carregando equipe..." />}>
      <TeamContent />
    </Suspense>
  );
}
