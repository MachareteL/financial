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
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-blue-100 text-sm font-medium">
                  Total do Período
                </p>
                <h3 className="text-2xl font-bold">
                  R${" "}
                  {summaryData.total.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">
                  Média por Item
                </p>
                <h3 className="text-2xl font-bold text-slate-900">
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

        <Card className="bg-white border-slate-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <PieChartIcon className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">
                  Maior Categoria
                </p>
                <h3 className="text-lg font-bold text-slate-900 truncate max-w-[150px]">
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
        <Card className="border-slate-100 shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Tendência Diária
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
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
                margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#64748b" }}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow:
                      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="amount"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart: Category Distribution */}
        <Card className="border-slate-100 shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-purple-500" />
              Por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
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
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categories.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        [
                          "#3b82f6",
                          "#8b5cf6",
                          "#10b981",
                          "#f59e0b",
                          "#ef4444",
                          "#64748b",
                        ][index % 6]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
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
                    <span className="text-xs font-medium text-slate-600">
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
      <Card className="border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-800">
            Maiores Despesas do Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
                    className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold text-xs">
                        {i + 1}
                      </div>
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${theme.bg} ${theme.text}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">
                          {expense.description}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(
                            expense.date.replace(/-/g, "/")
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900">
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
