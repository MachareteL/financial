import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DashboardDataDTO } from "@/domain/dto/dashboard.types.d.ts";

interface DailyFlowChartProps {
  data: DashboardDataDTO["dailySpending"];
}

export function DailyFlowChart({ data }: DailyFlowChartProps) {
  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <Card className="lg:col-span-2 shadow-sm border-slate-100 hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-base font-bold text-slate-800">
          Fluxo Diário
        </CardTitle>
        <CardDescription className="text-slate-500">
          Como o dinheiro saiu ao longo do mês
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-0 pr-4 pb-6">
        <div className="h-[300px] w-full">
          {data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
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
                  width={60}
                />
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    border: "none",
                    boxShadow:
                      "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
                    padding: "12px",
                  }}
                  itemStyle={{ color: "#1e293b", fontWeight: 600 }}
                  formatter={(value: number) => [
                    formatCurrency(value),
                    "Acumulado",
                  ]}
                  labelFormatter={(label) => (
                    <span className="text-slate-500 text-xs font-medium mb-2 block">
                      Dia {label}
                    </span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="spent"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSpent)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#2563eb" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400 text-sm bg-slate-50/50 rounded-xl border border-dashed border-slate-200 m-4">
              Ainda não há dados suficientes para exibir o gráfico.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
