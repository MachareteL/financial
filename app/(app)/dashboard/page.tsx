"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/auth/auth-provider"
import { useTeam } from "@/app/(app)/team/team-provider"
import { getDashboardDataUseCase, signOutUseCase } from "@/infrastructure/dependency-injection"
import type { DashboardDataDTO, DashboardFolderData, DashboardTransactionDTO } from "@/domain/dto/dashboard.types.d.ts"

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, LogOut, TrendingUp, TrendingDown, Wallet, 
  Loader2, ArrowRight, CalendarDays, AlertCircle 
} from "lucide-react"

// Charts
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell 
} from "recharts"
import { notify } from "@/lib/notify-helper"

// Cores
const COLORS = {
  good: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  chartLine: "#3b82f6",
  chartFill: "#3b82f6",
}

export default function DashboardPage() {
  const router = useRouter()
  const { session, loading: authLoading } = useAuth()
  const { currentTeam } = useTeam()

  // Date State
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  
  // Data State
  const [data, setData] = useState<DashboardDataDTO | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Refs para evitar double-fetch
  const isMounted = useRef(false)

  // Fetch Data
  useEffect(() => {
    if (authLoading) return
    if (!session || !currentTeam) return

    const loadData = async () => {
      setIsLoadingData(true)
      try {
        const result = await getDashboardDataUseCase.execute(
            currentTeam.team.id, 
            selectedMonth, 
            selectedYear
        )
        setData(result)
      } catch (error: any) {
        console.error("Dashboard error:", error)
        notify.error(error, "carregar os dados do painel")
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [currentTeam, selectedMonth, selectedYear, session, authLoading])

  const handleLogout = async () => {
    await signOutUseCase.execute()
    router.push("/auth")
  }

  // Helpers
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ]

  const formatCurrency = (val: number) => 
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  const getPercentage = (spent: number, total: number) => {
    if (total === 0) return spent > 0 ? 100 : 0
    return Math.min((spent / total) * 100, 100)
  }

  // --- Loading Screen ---
  if (authLoading || !session || !currentTeam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* --- HEADER E CONTROLES --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Visão Geral</h1>
          <p className="text-sm text-gray-500">
            {currentTeam.team.name} • {months[selectedMonth - 1]} {selectedYear}
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
        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Saldo Atual</p>
                <h2 className="text-3xl font-bold">
                  {data ? formatCurrency(data.balance) : "..."}
                </h2>
              </div>
              <div className="bg-white/20 p-2 rounded-lg">
                <Wallet className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-4 text-xs text-blue-100 flex items-center gap-1">
              {data && data.totalIncome > 0 ? (
                <>
                  <span>{((data.balance / data.totalIncome) * 100).toFixed(0)}% da renda disponível</span>
                </>
              ) : "Defina seu orçamento"}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Entradas</p>
                <h2 className="text-2xl font-bold text-gray-900">
                   {data ? formatCurrency(data.totalIncome) : "..."}
                </h2>
              </div>
              <div className="bg-green-50 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <Progress value={100} className="h-1 mt-4 bg-gray-100" indicatorClassName="bg-green-500" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
             <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Saídas</p>
                <h2 className="text-2xl font-bold text-gray-900">
                   {data ? formatCurrency(data.totalSpent) : "..."}
                </h2>
              </div>
              <div className="bg-red-50 p-2 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <Progress 
                value={data ? getPercentage(data.totalSpent, data.totalIncome) : 0} 
                className="h-1 mt-4 bg-gray-100" 
                indicatorClassName="bg-red-500" 
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- COLUNA ESQUERDA (2/3) --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Gráfico de Evolução */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Evolução de Gastos (Diário)</CardTitle>
              <CardDescription>Acumulado ao longo do mês</CardDescription>
            </CardHeader>
            <CardContent className="pl-0">
              <div className="h-[250px] w-full">
                {data?.dailySpending && data.dailySpending.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.dailySpending} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis 
                        stroke="#94a3b8" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(value) => `R$${value/1000}k`} 
                      />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <Tooltip 
                         contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                         formatter={(value: number) => [formatCurrency(value), "Acumulado"]}
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
                  <div className="flex h-full items-center justify-center text-gray-400 text-sm">
                    Sem dados para exibir
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pastas do Orçamento (Detalhado) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {data?.folders.map((folder) => {
               const percent = getPercentage(folder.spent, folder.budgeted);
               const isOverflow = percent > 100;
               
               return (
                 <Card key={folder.id} className="overflow-hidden border-l-4" style={{ borderLeftColor: isOverflow ? '#ef4444' : '#10b981' }}>
                   <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-gray-800">{folder.name}</h3>
                        <Badge variant={isOverflow ? "destructive" : "secondary"}>
                          {percent.toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 mb-2">
                         <span>{formatCurrency(folder.spent)}</span>
                         <span>de {formatCurrency(folder.budgeted)}</span>
                      </div>
                      <Progress 
                        value={percent} 
                        className="h-2" 
                        indicatorClassName={isOverflow ? "bg-red-500" : "bg-emerald-500"} 
                      />
                   </CardContent>
                 </Card>
               )
             })}
          </div>

        </div>

        {/* --- COLUNA DIREITA (1/3) --- */}
        <div className="space-y-6">
          
          {/* Ação Rápida */}
          <Button 
            className="w-full h-12 text-lg shadow-md bg-primary hover:bg-primary/90 transition-all"
            onClick={() => router.push("/expenses/new")}
          >
            <Plus className="mr-2 h-5 w-5" /> Registrar Gasto
          </Button>

          {/* Últimas Transações */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Últimas Transações</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {data?.recentTransactions && data.recentTransactions.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {data.recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col gap-0.5">
                         <span className="font-medium text-sm text-gray-900 truncate max-w-[150px]">
                            {tx.description || "Sem descrição"}
                         </span>
                         <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal border-gray-200 text-gray-500">
                              {tx.categoryName}
                            </Badge>
                            <span>• {new Date(tx.date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}</span>
                         </div>
                      </div>
                      <span className="font-bold text-sm text-gray-900">
                        -{formatCurrency(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 text-sm">
                   Nenhuma transação recente.
                </div>
              )}
              <div className="p-3 border-t border-gray-100">
                 <Button variant="ghost" className="w-full text-xs text-gray-500 h-8" onClick={() => router.push('/expenses')}>
                    Ver tudo <ArrowRight className="ml-1 w-3 h-3" />
                 </Button>
              </div>
            </CardContent>
          </Card>

          {/* Top Categorias (Mini Gráfico) */}
          <Card>
             <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Top Categorias</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="space-y-3 mt-2">
                  {data?.expenseChartData.slice(0, 4).map((cat, i) => (
                     <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                           <span className="font-medium text-gray-700">{cat.name}</span>
                           <span className="text-gray-500">{formatCurrency(cat.amount)}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                           <div 
                             className="bg-blue-500 h-1.5 rounded-full" 
                             style={{ width: `${getPercentage(cat.amount, data.totalSpent)}%` }}
                           />
                        </div>
                     </div>
                  ))}
                </div>
             </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}