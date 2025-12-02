"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth/auth-provider";
import { useTeam } from "@/app/(app)/team/team-provider";
import {
  getDashboardDataUseCase,
  signOutUseCase,
} from "@/infrastructure/dependency-injection";
import type { DashboardDataDTO } from "@/domain/dto/dashboard.types.d.ts";
import { notify } from "@/lib/notify-helper";

// Layout Components
import { PageContainer, Section } from "@/components/layout";
import { LoadingState, EmptyState } from "@/components/lemon";
import { Button } from "@/components/ui/button";

// Dashboard Components
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
        const result = await getDashboardDataUseCase.execute(
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
    await signOutUseCase.execute();
    router.push("/auth");
  };

  if (authLoading || !session || !currentTeam) {
    return <LoadingState message="Preparando seu painel financeiro..." />;
  }

  return (
    <PageContainer>
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

      <Section
        title="Resumo Financeiro"
        description="Suas principais métricas deste mês"
      >
        {isLoadingData ? (
          <LoadingState message="Carregando resumo..." />
        ) : (
          <SummaryCards data={data} isLoading={false} />
        )}
      </Section>

      <Section
        title="Saúde do Orçamento"
        description="Acompanhe seus limites de gastos"
      >
        {isLoadingData ? (
          <LoadingState message="Verificando orçamentos..." />
        ) : data && data.folders.length > 0 ? (
          <BudgetHealth folders={data.folders} />
        ) : (
          <EmptyState
            title="Nenhum orçamento configurado"
            message="Configure seus primeiros limites de gastos para acompanhar a saúde financeira do casal."
            action={
              <Button onClick={() => router.push("/budget")}>
                Criar primeiro orçamento
              </Button>
            }
          />
        )}
      </Section>

      <Section
        title="Atividade Recente"
        description="Fluxo diário e últimas transações"
      >
        {isLoadingData ? (
          <LoadingState message="Buscando transações..." />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <DailyFlowChart data={data?.dailySpending || []} />
            <RecentTransactions transactions={data?.recentTransactions || []} />
          </div>
        )}
      </Section>
    </PageContainer>
  );
}
