"use client";

import type { TeamMembership } from "@/domain/dto/user.types.d.ts";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";

type TeamContextType = {
  currentTeam: TeamMembership | null;
  setCurrentTeam: (team: TeamMembership) => void;
  teams: TeamMembership[];
};

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error("useTeam deve ser usado dentro de um TeamProvider");
  }
  return context;
}

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const [currentTeam, setCurrentTeam] = useState<TeamMembership | null>(null);
  const router = useRouter();

  const teams = useMemo(() => session?.teams || [], [session]);

  useEffect(() => {
    if (!loading && session) {
      if (teams.length > 0) {
        const savedTeamId = localStorage.getItem("currentTeamId");
        const savedTeam = teams.find((t) => t.team.id === savedTeamId);

        setCurrentTeam(savedTeam || teams[0]);
      } else if (session.user) {
        router.push("/onboarding");
      }
    }
  }, [session, loading, teams, router]);

  const handleSetCurrentTeam = (team: TeamMembership) => {
    setCurrentTeam(team);
    localStorage.setItem("currentTeamId", team.team.id);
    window.location.reload();
  };

  const value = {
    currentTeam,
    setCurrentTeam: handleSetCurrentTeam,
    teams,
  };

  if (!currentTeam && !loading) {
    if (teams.length > 0) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    return null;
  }

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}
