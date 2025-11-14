"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Plus, TrendingUp, AlertTriangle, LogOut, Users, Tag, Target, DollarSign } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/app/auth/auth-provider"
import { getDashboardDataUseCase } from "@/infrastructure/dependency-injection" 
import type { DashboardDataDTO } from "@/domain/dto/dashboard.types" 
import { signOutUseCase } from "@/infrastructure/dependency-injection"

type ChartExpenseData = DashboardDataDTO['expenses'][number];
type MonthlyData = DashboardDataDTO['monthlyData'];

const COLORS = {
  necessidades: "#10b981",
  desejos: "#f59e0b",
  poupanca: "#3b82f6",
}

export default function DashboardPage() {
  const { session, loading: authLoading } = useAuth()
  const router = useRouter()

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const [expenseData, setExpenseData] = useState<ChartExpenseData[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData>({
    necessidades: 0,
    desejos: 0,
    poupanca: 0,
    total: 0,
  })
  const [monthlyIncome, setMonthlyIncome] = useState(0)
  const [isLoadingData, setIsLoadingData] = useState(true)

  const teamId = session?.teams?.[0]?.team.id
  
  useEffect(() => {
    if (authLoading) return;

    if (!session) {
      router.push("/auth");
      return;
    }

    if (!teamId) { 
      router.push("/onboarding");
      return;
    }

    const loadData = async () => {
      setIsLoadingData(true);
      try {
        const dashboardData = await getDashboardDataUseCase.execute(teamId, selectedMonth, selectedYear)

        setExpenseData(dashboardData.expenses)
        setMonthlyData(dashboardData.monthlyData)
        setMonthlyIncome(dashboardData.monthlyIncome)
      } catch (error: any) {
        console.error("[Dashboard] Error loading data:", error)
        toast({
          title: "Erro ao carregar dados",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setIsLoadingData(false);
      }
    }
    
    loadData();

  }, [session, authLoading, teamId, selectedMonth, selectedYear, router])

  const handleLogout = async () => {
    try {
      await signOutUseCase.execute()
      router.push("/auth")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const getClassificationPercentage = (classification: keyof MonthlyData) => {
    if (monthlyIncome === 0) return 0
    return (monthlyData[classification] / monthlyIncome) * 100
  }

  const getAlert = () => {
    if (monthlyIncome === 0) return null

    const necessidadesPercent = getClassificationPercentage("necessidades")
    const desejosPercent = getClassificationPercentage("desejos")

    const actualSavings = monthlyIncome - monthlyData.total
    const actualSavingsPercent = (actualSavings / monthlyIncome) * 100

    if (necessidadesPercent > 50) {
      return {
        type: "warning",
        message: `Gastos com Necessidades estão em ${necessidadesPercent.toFixed(1)}% da receita (meta: 50%)`,
      }
    }
    if (desejosPercent > 30) {
      return {
        type: "warning",
        message: `Gastos com Desejos estão em ${desejosPercent.toFixed(1)}% da receita (meta: 30%)`,
      }
    }
    if (actualSavingsPercent < 20) {
      return {
        type: "info",
        message: `Poupança está em ${actualSavingsPercent.toFixed(1)}% da receita (meta: 20%)`,
      }
    }
    return null
  }

  // Loading unificado
  if (authLoading || !session || !teamId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Carregando...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    )
  }

  const pieData = [
    { name: "Necessidades", value: monthlyData.necessidades, color: COLORS.necessidades },
    { name: "Desejos", value: monthlyData.desejos, color: COLORS.desejos },
    { name: "Poupança", value: monthlyData.poupanca, color: COLORS.poupanca },
  ].filter((item) => item.value > 0)

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ]

  const alert = getAlert()

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Bem-vindo, {session.user.name} - {session.teams[0].team.name}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) => setSelectedMonth(Number.parseInt(value))}
            >
              <SelectTrigger
                className="w-32"
                loading={isLoadingData}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={index} value={(index + 1).toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number.parseInt(value))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2023, 2024, 2025].map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => router.push("/expenses/new")}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Gasto
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {alert && (
          <Card
            className={`border-l-4 ${alert.type === "warning" ? "border-l-orange-500 bg-orange-50" : "border-l-blue-500 bg-blue-50"}`}
          >
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <AlertTriangle
                  className={`w-5 h-5 ${alert.type === "warning" ? "text-orange-600" : "text-blue-600"}`}
                />
                <p className={`font-medium ${alert.type === "warning" ? "text-orange-800" : "text-blue-800"}`}>
                  {alert.message}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Card: Receita Total */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {monthlyIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          {/* Card: Total Gasto */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {monthlyData.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                {monthlyIncome > 0 ? `${((monthlyData.total / monthlyIncome) * 100).toFixed(1)}% da receita` : ""}
              </p>
            </CardContent>
          </Card>

           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Necessidades</CardTitle>
              <div className="text-xs text-muted-foreground">50% meta</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {getClassificationPercentage("necessidades").toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                R$ {monthlyData.necessidades.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Desejos</CardTitle>
              <div className="text-xs text-muted-foreground">30% meta</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {getClassificationPercentage("desejos").toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                R$ {monthlyData.desejos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Poupança Real</CardTitle>
              <div className="text-xs text-muted-foreground">20% meta</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {monthlyIncome > 0 ? (((monthlyIncome - monthlyData.total) / monthlyIncome) * 100).toFixed(1) : "0.0"}%
              </div>
              <p className="text-xs text-muted-foreground">
                R$ {(monthlyIncome - monthlyData.total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Pizza */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição 50/30/20</CardTitle>
              <CardDescription>Distribuição dos gastos por classificação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent as number ?? 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [
                          `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                          "Valor",
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Nenhum gasto registrado neste mês
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Barras */}
          <Card>
            <CardHeader>
              <CardTitle>Gastos por Categoria</CardTitle>
              <CardDescription>Distribuição dos gastos por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {expenseData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expenseData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => [
                          `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                          "Valor",
                        ]}
                      />
                      <Bar
                        dataKey="amount"
                        fill="#8884d8"
                      >
                        {/* Preenchimento com cor da classificação */}
                        {expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[entry.classification as keyof typeof COLORS] || "#8884d8"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Nenhum gasto registrado neste mês
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botões de Navegação */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Button onClick={() => router.push("/expenses/new")} className="h-16">
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Gasto
          </Button>
          <Button variant="outline" onClick={() => router.push("/expenses")} className="h-16">
            <TrendingUp className="w-5 h-5 mr-2" />
            Ver Todos os Gastos
          </Button>
          <Button variant="outline" onClick={() => router.push("/categories")} className="h-16">
            <Tag className="w-5 h-5 mr-2" />
            Gerenciar Categorias
          </Button>
          <Button variant="outline" onClick={() => router.push("/team")} className="h-16">
            <Users className="w-5 h-5 mr-2" />
            Gerenciar Time
          </Button>
          <Button variant="outline" onClick={() => router.push("/budget")} className="h-16">
            <Target className="w-5 h-5 mr-2" />
            Orçamento
          </Button>
        </div>
      </div>
    </div>
  )
}