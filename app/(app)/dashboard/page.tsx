"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth/auth-provider";
import { useTeam } from "@/app/(app)/team/team-provider";
import { getDashboardDataUseCase, signOutUseCase } from "@/infrastructure/dependency-injection";
import type { DashboardDataDTO } from "@/domain/dto/dashboard.types.d.ts";

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Loader2,
  ArrowRight,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  PiggyBank,
  ShoppingBag,
  Home,
  Plus,
  LogOut,
  Info, // Importado
} from "lucide-react";

// Charts
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { notify } from "@/lib/notify-helper";

const COLORS = {
  good: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  chartLine: "#3b82f6",
  chartFill: "#3b82f6",
};

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

  // Helpers
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];

  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const getPercentage = (spent: number, total: number) => {
    if (total === 0) return spent > 0 ? 100 : 0;
    return Math.min((spent / total) * 100, 100);
  };

  const getFolderConfig = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("necessidades") || n.includes("fixo")) {
      return { icon: Home, color: "text-blue-600", bg: "bg-blue-100", bar: "bg-blue-600" };
    }
    if (n.includes("desejos") || n.includes("lazer") || n.includes("variável")) {
      return { icon: ShoppingBag, color: "text-purple-600", bg: "bg-purple-100", bar: "bg-purple-600" };
    }
    if (n.includes("poupança") || n.includes("investimentos") || n.includes("futuro")) {
      return { icon: PiggyBank, color: "text-green-600", bg: "bg-green-100", bar: "bg-green-600" };
    }
    return { icon: Wallet, color: "text-slate-600", bg: "bg-slate-100", bar: "bg-slate-600" };
  };

  const getStatusConfig = (status: "good" | "warning" | "danger") => {
    switch (status) {
      case "good":
        return { label: "No Caminho", color: "text-green-600 bg-green-50 border-green-200", icon: CheckCircle2 };
      case "warning":
        return { label: "Atenção", color: "text-amber-600 bg-amber-50 border-amber-200", icon: AlertTriangle };
      case "danger":
        return { label: "Estourou", color: "text-red-600 bg-red-50 border-red-200", icon: AlertTriangle };
    }
  };

  if (authLoading || !session || !currentTeam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      {/* --- HEADER E CONTROLES --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Olá, {session.user.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-slate-500">
            Aqui está o resumo financeiro de <strong>{currentTeam.team.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={selectedMonth.toString()}
            onValueChange={(v) => setSelectedMonth(Number(v))}
            disabled={isLoadingData}
          >
            <SelectTrigger className="w-[130px] bg-white">
              <CalendarDays className="w-4 h-4 mr-2 text-gray-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m, i) => (
                <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedYear.toString()}
            onValueChange={(v) => setSelectedYear(Number(v))}
            disabled={isLoadingData}
          >
            <SelectTrigger className="w-[100px] bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[2023, 2024, 2025, 2026].map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
            </SelectContent>
          </Select>

          <Button size="icon" variant="outline" onClick={handleLogout} className="ml-auto sm:ml-0">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* --- RESUMO PRINCIPAL (KPIs) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-600 to-blue-700 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
          <CardContent className="p-6 relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Saldo Mensal</p>
                <h2 className="text-3xl font-bold tracking-tight">
                  {data ? formatCurrency(data.balance) : "..."}
                </h2>
              </div>
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Wallet className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-blue-100">
              {data && data.totalIncome > 0 ? (
                <>
                  <span className={data.balance >= 0 ? "text-emerald-300 font-bold" : "text-rose-300 font-bold"}>
                    {((data.balance / data.totalIncome) * 100).toFixed(0)}%
                  </span>
                  <span>da receita disponível</span>
                </>
              ) : (
                <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded-md">
                  <span>Sem receita definida</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="hover:bg-white/20 p-0.5 rounded-full transition-colors" title="Info">
                        <Info className="w-4 h-4 text-blue-200 hover:text-white" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-4" align="start">
                      <h4 className="font-semibold text-sm mb-2">Defina sua Receita</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Para calcular seu saldo e metas corretamente, você precisa definir o orçamento deste mês.
                      </p>
                      <Button 
                        size="sm" 
                        className="w-full" 
                        onClick={() => router.push("/budget")}
                      >
                        Ir para Orçamento
                      </Button>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Entradas</p>
                <h2 className="text-2xl font-bold text-gray-900">
                  {data ? formatCurrency(data.totalIncome) : "..."}
                </h2>
              </div>
              <div className="bg-emerald-50 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <Progress value={100} className="h-1.5 mt-4 bg-gray-100" indicatorClassName="bg-emerald-500" />
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Saídas</p>
                <h2 className="text-2xl font-bold text-gray-900">
                  {data ? formatCurrency(data.totalSpent) : "..."}
                </h2>
              </div>
              <div className="bg-rose-50 p-2 rounded-lg">
                <TrendingDown className="w-5 h-5 text-rose-600" />
              </div>
            </div>
            <Progress
              value={data ? getPercentage(data.totalSpent, data.totalIncome) : 0}
              className="h-1.5 mt-4 bg-gray-100"
              indicatorClassName={data && data.totalSpent > data.totalIncome ? "bg-rose-500" : "bg-blue-500"}
            />
          </CardContent>
        </Card>
      </div>

      {/* --- SAÚDE DO ORÇAMENTO (50/30/20) --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-600 rounded-full" />
            Saúde do Orçamento
          </h2>
          <Button variant="outline" size="sm" onClick={() => router.push("/budget")}>
            Ajustar Metas
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {data?.folders.map((folder) => {
            const { icon: Icon, color, bg, bar } = getFolderConfig(folder.name);
            const { label, color: statusColor, icon: StatusIcon } = getStatusConfig(folder.status);
            const percentageUsed = getPercentage(folder.spent, folder.budgeted);
            const remaining = folder.budgeted - folder.spent;

            return (
              <Card key={folder.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 pt-5 px-5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${bg}`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-slate-800">
                          {folder.name}
                        </CardTitle>
                        <CardDescription className="text-xs font-medium mt-0.5">
                          Meta: {formatCurrency(folder.budgeted)}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className={`${statusColor} text-[10px] py-0.5 px-2 h-6 gap-1`}>
                      <StatusIcon className="w-3 h-3" /> {label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Gasto</span>
                      <span className="font-bold text-slate-900">{formatCurrency(folder.spent)}</span>
                    </div>
                    <Progress value={percentageUsed} className="h-2.5 bg-slate-100" indicatorClassName={bar} />
                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="text-slate-400">{percentageUsed.toFixed(0)}% usado</span>
                      <span className={`font-medium ${remaining < 0 ? "text-red-600" : "text-emerald-600"}`}>
                        {remaining < 0 ? "Excedido: " : "Disponível: "}
                        {formatCurrency(Math.abs(remaining))}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- GRÁFICO DE EVOLUÇÃO --- */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-800">Fluxo Diário</CardTitle>
            <CardDescription>Como o dinheiro saiu ao longo do mês</CardDescription>
          </CardHeader>
          <CardContent className="pl-0 pr-4">
            <div className="h-[280px] w-full">
              {data?.dailySpending && data.dailySpending.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.dailySpending} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="day"
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `R$${value / 1000}k`}
                    />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(value: number) => [formatCurrency(value), "Acumulado"]}
                      labelFormatter={(label) => `Dia ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="spent"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorSpent)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400 text-sm bg-slate-50/50 rounded-lg m-4">
                  Ainda não há dados suficientes para exibir o gráfico.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* --- ÚLTIMAS TRANSAÇÕES --- */}
        <div className="space-y-6">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-semibold text-slate-800">Últimos Gastos</CardTitle>
                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => router.push("/expenses/new")} title="Novo Gasto">
                  <Plus className="h-4 w-4 text-slate-700" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              {data?.recentTransactions && data.recentTransactions.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {data.recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors">
                      <div className="flex flex-col gap-1 max-w-[60%]">
                        <span className="font-medium text-sm text-slate-900 truncate" title={tx.description || ""}>
                          {tx.description || "Sem descrição"}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 truncate max-w-[100px]">
                            {tx.categoryName}
                          </span>
                          <span>• {new Date(tx.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</span>
                        </div>
                      </div>
                      <span className="font-bold text-sm text-slate-900 whitespace-nowrap">
                        - {formatCurrency(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center flex flex-col items-center justify-center h-full text-slate-500 space-y-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-sm">Nenhum gasto recente.</p>
                  <Button variant="outline" size="sm" onClick={() => router.push("/expenses/new")}>
                    Registrar Agora
                  </Button>
                </div>
              )}
            </CardContent>
            {data?.recentTransactions && data.recentTransactions.length > 0 && (
              <div className="p-3 border-t border-slate-100">
                <Button
                  variant="ghost"
                  className="w-full text-xs text-slate-500 hover:text-blue-600 h-8"
                  onClick={() => router.push("/expenses")}
                >
                  Ver extrato completo <ArrowRight className="ml-1 w-3 h-3" />
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}