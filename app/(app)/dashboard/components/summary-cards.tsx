import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Info,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { DashboardDataDTO } from "@/domain/dto/dashboard.types.d.ts";

interface SummaryCardsProps {
  data: DashboardDataDTO | null;
  isLoading: boolean;
}

export function SummaryCards({ data, isLoading }: SummaryCardsProps) {
  const router = useRouter();

  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const getPercentage = (spent: number, total: number) => {
    if (total === 0) return spent > 0 ? 100 : 0;
    return Math.min((spent / total) * 100, 100);
  };

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-muted rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* BALANCE CARD */}
      <Card className="border-none shadow-lg bg-gradient-to-br from-primary via-primary/80 to-purple-600 text-primary-foreground relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-primary/30 rounded-full blur-xl" />

        <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-primary-foreground/80 text-xs font-medium uppercase tracking-wider mb-1">
                Saldo Atual
              </p>
              <h2 className="text-3xl font-bold tracking-tight">
                {formatCurrency(data.balance)}
              </h2>
            </div>
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md shadow-sm">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>

          <div className="mt-6">
            {data.totalIncome > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-primary-foreground/80">
                  <span>Disponível</span>
                  <span className="font-bold text-primary-foreground">
                    {((data.balance / data.totalIncome) * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress
                  value={(data.balance / data.totalIncome) * 100}
                  className="h-1.5 bg-primary-foreground/20"
                  indicatorClassName="bg-emerald-400"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm w-fit">
                <span className="text-xs font-medium">Sem orçamento</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="hover:bg-white/20 p-1 rounded-full transition-colors">
                      <Info className="w-3.5 h-3.5 text-primary-foreground/70 hover:text-primary-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-72 p-4 border-none shadow-xl"
                    align="start"
                  >
                    <h4 className="font-semibold text-sm mb-2 text-foreground">
                      Defina sua Receita
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                      Para calcular seu saldo e metas corretamente, defina o
                      orçamento deste mês.
                    </p>
                    <Button
                      size="sm"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
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

      {/* INCOME CARD */}
      <Card className="border-border shadow-sm bg-card hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-6 flex flex-col justify-between h-full">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">
                Entradas
              </p>
              <h2 className="text-2xl font-bold text-foreground">
                {formatCurrency(data.totalIncome)}
              </h2>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2.5 rounded-xl">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50/50 dark:bg-emerald-900/10 px-2 py-1 rounded-md w-fit">
            <ArrowUpRight className="w-3 h-3" />
            <span>Receitas do mês</span>
          </div>
        </CardContent>
      </Card>

      {/* EXPENSES CARD */}
      <Card className="border-border shadow-sm bg-card hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-6 flex flex-col justify-between h-full">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">
                Saídas
              </p>
              <h2 className="text-2xl font-bold text-foreground">
                {formatCurrency(data.totalSpent)}
              </h2>
            </div>
            <div className="bg-rose-50 dark:bg-rose-900/20 p-2.5 rounded-xl">
              <TrendingDown className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Comprometido</span>
              <span className="font-bold text-foreground">
                {getPercentage(data.totalSpent, data.totalIncome).toFixed(0)}%
              </span>
            </div>
            <Progress
              value={getPercentage(data.totalSpent, data.totalIncome)}
              className="h-1.5 bg-muted"
              indicatorClassName={
                data.totalSpent > data.totalIncome
                  ? "bg-destructive"
                  : "bg-primary"
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
