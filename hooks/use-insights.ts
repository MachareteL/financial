"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getPendingInsightsAction,
  markInsightAsReadAction,
} from "@/app/(app)/dashboard/_actions/insights.actions";
import type { Insight } from "@/domain/entities/insight";
import { notify } from "@/lib/notify-helper";
import { useAuth } from "@/components/providers/auth-provider";

import { useTeam } from "@/app/(app)/team/team-provider";

export function useInsights() {
  const { session } = useAuth();
  const { currentTeam } = useTeam();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInsights = useCallback(async () => {
    if (!currentTeam?.team?.id) return;
    try {
      const data = await getPendingInsightsAction(currentTeam.team.id);
      // Ensure date strings are converted back to Date objects if needed, though UI might handle strings
      // If Insight entity expects Date, we might need to map it back.
      // But here we are just setting state. Let's assume the UI can handle ISO strings or we convert.
      // Ideally we map it back to domain entities or a DTO.
      // For simplicity, let's cast or map.
      const mappedData = data.map((d) => ({
        ...d,
        createdAt: new Date(d.createdAt),
      })) as Insight[];

      setInsights(mappedData);
    } catch (error) {
      console.error("Failed to fetch insights", error);
    }
  }, [currentTeam?.team?.id]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const markAsRead = async (insightId: string) => {
    try {
      await markInsightAsReadAction(insightId);
      setInsights((prev) => prev.filter((i) => i.id !== insightId));
    } catch (error) {
      notify.error(error, "marcar como lida");
    }
  };

  return {
    insights,
    loading,
    fetchInsights,
    markAsRead,
    hasTeam: !!currentTeam,
  };
}
