"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth/auth-provider";
import { useTeam } from "@/app/(app)/team/team-provider";
import { getDashboardDataAction } from "./_actions/dashboard.actions";
import { signOutAction } from "@/app/auth/_actions/auth.actions";
import type { DashboardDataDTO } from "@/domain/dto/dashboard.types.d.ts";
import { notify } from "@/lib/notify-helper";
import { Loader2, Wallet } from "lucide-react";

// Components
import { DashboardHeader } from "./components/dashboard-header";
import { SummaryCards } from "./components/summary-cards";
import { BudgetHealth } from "./components/budget-health";
import { DailyFlowChart } from "./components/daily-flow-chart";
import { RecentTransactions } from "./components/recent-transactions";

export default function DashboardPage() {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const { currentTeam } = useTeam();

  // Date State
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Data State
  const [data, setData] = useState<DashboardDataDTO | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch Data
  useEffect(() => {
    if (authLoading) return;
    if (!session || !currentTeam) return;

    const loadData = async () => {
      setIsLoadingData(true);
      try {
        const result = await getDashboardDataAction(
          currentTeam.team.id,
          selectedMonth,
          selectedYear
        );
        setData(result);
      } catch (error: any) {
        console.error("Dashboard error:", error);
        notify.error(error, "carregar os dados do painel");
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [currentTeam, selectedMonth, selectedYear, session, authLoading]);

  const handleLogout = async () => {
    await signOutAction();
    router.push("/auth");
  };

  if (authLoading || !session || !currentTeam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500 max-w-7xl mx-auto p-4 md:p-8">
      {/* HEADER */}
      <DashboardHeader
        userName={session.user.name.split(" ")[0]}
        teamName={currentTeam.team.name}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        isLoading={isLoadingData}
        onLogout={handleLogout}
      />

      {/* SUMMARY CARDS */}
      <SummaryCards data={data} isLoading={isLoadingData} />

      {/* BUDGET HEALTH */}
      {data && data.folders.length > 0 && (
        <BudgetHealth folders={data.folders} />
      )}

      {/* CHARTS & TRANSACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Flow Chart */}
        <DailyFlowChart data={data?.dailySpending || []} />

        {/* Recent Transactions */}
        <RecentTransactions transactions={data?.recentTransactions || []} />
      </div>
    </div>
  );
}
