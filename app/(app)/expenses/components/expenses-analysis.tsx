import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { getCategoryStyle } from "../utils";
import type { ExpenseDetailsDTO } from "@/domain/dto/expense.types.d.ts";
import type { CategoryDetailsDTO } from "@/domain/dto/category.types.d.ts";

interface ExpensesAnalysisProps {
  summaryData: { total: number; count: number };
  displayedExpenses: ExpenseDetailsDTO[];
  categories: CategoryDetailsDTO[];
}

export function ExpensesAnalysis({
  summaryData,
  displayedExpenses,
  categories,
}: ExpensesAnalysisProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet className="w-24 h-24" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-inner">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-primary-foreground/90 text-sm font-medium">
                  Total do Período
                </p>
                <h3 className="text-2xl font-bold tracking-tight">
                  R${" "}
                  {summaryData.total.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-chart-2/10 rounded-xl">
                <TrendingUp className="w-6 h-6 text-chart-2" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Média por Item
                </p>
                <h3 className="text-2xl font-bold text-foreground tracking-tight">
                  R${" "}
                  {(
                    summaryData.total / (summaryData.count || 1)
                  ).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-chart-4/10 rounded-xl">
                <PieChartIcon className="w-6 h-6 text-chart-4" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Maior Categoria
                </p>
                <h3 className="text-lg font-bold text-foreground truncate max-w-[150px] tracking-tight">
                  {(() => {
                    const catTotals: Record<string, number> = {};
                    displayedExpenses.forEach((e) => {
                      const name = e.category?.name || "Outros";
                      catTotals[name] = (catTotals[name] || 0) + e.amount;
                    });
                    const topCat = Object.entries(catTotals).sort(
                      (a, b) => b[1] - a[1]
                    )[0];
                    return topCat ? topCat[0] : "-";
                  })()}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart: Daily Trend */}
        <Card className="border-border/50 shadow-sm overflow-hidden bg-card/50">
          <CardHeader className="pb-2 border-b border-border/40 bg-muted/20">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-primary" />
              Tendência Diária
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={(() => {
                  const daily: Record<string, number> = {};
                  displayedExpenses.forEach((e) => {
                    const date = new Date(
                      e.date.replace(/-/g, "/")
                    ).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                    });
                    daily[date] = (daily[date] || 0) + e.amount;
                  });
                  return Object.entries(daily)
                    .map(([date, amount]) => ({ date, amount }))
                    .sort((a, b) => {
                      const [dA, mA] = a.date.split("/").map(Number);
                      const [dB, mB] = b.date.split("/").map(Number);
                      return mA - mB || dA - dB;
                    })
                    .slice(-14); // Last 14 days with data
                })()}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border) / 0.5)"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid hsl(var(--border))",
                    backgroundColor: "hsl(var(--popover))",
                    color: "hsl(var(--popover-foreground))",
                    boxShadow: "var(--shadow-card-hover)",
                  }}
                  formatter={(value: number) => [
                    `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                    "Valor",
                  ]}
                />
                <Bar
                  dataKey="amount"
                  fill="hsl(var(--primary))"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart: Category Distribution */}
        <Card className="border-border/50 shadow-sm overflow-hidden bg-card/50">
          <CardHeader className="pb-2 border-b border-border/40 bg-muted/20">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
              <PieChartIcon className="w-4 h-4 text-chart-2" />
              Por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={(() => {
                    const catTotals: Record<string, number> = {};
                    displayedExpenses.forEach((e) => {
                      const name = e.category?.name || "Outros";
                      catTotals[name] = (catTotals[name] || 0) + e.amount;
                    });
                    return Object.entries(catTotals)
                      .map(([name, value]) => ({ name, value }))
                      .sort((a, b) => b.value - a.value)
                      .slice(0, 6); // Top 6 categories
                  })()}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {categories.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        [
                          "hsl(var(--chart-1))", // Lime
                          "hsl(var(--chart-2))", // Purple
                          "hsl(var(--chart-4))", // Teal
                          "hsl(var(--chart-5))", // Tangerine
                          "hsl(var(--destructive))", // Red
                          "hsl(var(--muted))", // Muted
                        ][index % 6]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid hsl(var(--border))",
                    backgroundColor: "hsl(var(--popover))",
                    color: "hsl(var(--popover-foreground))",
                    boxShadow: "var(--shadow-card-hover)",
                  }}
                  formatter={(value: number) =>
                    `R$ ${value.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}`
                  }
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-xs font-medium text-muted-foreground">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Expenses */}
      <Card className="border-border/50 shadow-sm bg-card/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wider">
            Maiores Despesas do Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {displayedExpenses
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 3)
              .map((expense, i) => {
                const { icon: Icon, theme } = getCategoryStyle(
                  expense.category?.budgetCategoryName || null
                );
                return (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground font-bold text-[10px]">
                        {i + 1}
                      </div>
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center ${theme.bg} ${theme.text}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          {expense.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(
                            expense.date.replace(/-/g, "/")
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-foreground text-sm">
                      R${" "}
                      {expense.amount.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
