"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Plus, TrendingUp, AlertTriangle, LogOut, Users, Tag, Target, DollarSign } from "lucide-react"
import { getUserProfile, signOut } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/app/auth/auth-provider"
import { getDashboardDataUseCase } from "@/infrastructure/dependency-injection"

interface ExpenseData {
  category: string
  amount: number
  classification: string
}

interface MonthlyData {
  necessidades: number
  desejos: number
  poupanca: number
  total: number
}

const COLORS = {
  necessidades: "#10b981",
  desejos: "#f59e0b",
  poupanca: "#3b82f6",
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [expenseData, setExpenseData] = useState<ExpenseData[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData>({
    necessidades: 0,
    desejos: 0,
    poupanca: 0,
    total: 0,
  })
  const [profile, setProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [monthlyIncome, setMonthlyIncome] = useState(0)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && !profile && !profileLoading) {
      loadProfile()
    }
  }, [user])

  useEffect(() => {
    if (profile) {
      loadExpenseData()
    }
  }, [selectedMonth, selectedYear, profile])

  const loadProfile = async () => {
    if (!user || profileLoading) return

    setProfileLoading(true)
    try {
      console.log("[v0] Loading profile for user:", user.email)
      const userProfile = await getUserProfile()
      console.log("[v0] Profile loaded:", userProfile)

      if (!userProfile) {
        console.log("[v0] No profile found, redirecting to auth")
        router.push("/auth")
        return
      }

      if (!userProfile.familyId) {
        console.log("[v0] No family ID found, redirecting to onboarding")
        router.push("/onboarding")
        return
      }

      setProfile(userProfile)
    } catch (error) {
      console.error("Error loading profile:", error)
      toast({
        title: "Erro ao carregar perfil",
        description: "Tente fazer login novamente",
        variant: "destructive",
      })
      router.push("/auth")
    } finally {
      setProfileLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      setProfile(null)
      router.push("/auth")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const loadExpenseData = async () => {
    if (!profile?.familyId) {
      console.log("[v0] No familyId in profile, redirecting to onboarding")
      router.push("/onboarding")
      return
    }

    try {
      const dashboardData = await getDashboardDataUseCase.execute(profile.familyId, selectedMonth, selectedYear)

      setExpenseData(dashboardData.expenses)
      setMonthlyData(dashboardData.monthlyData)
      setMonthlyIncome(dashboardData.monthlyIncome)
    } catch (error: any) {
      console.error("[v0] Error loading dashboard data:", error)
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      })
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Carregando...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Configurando perfil...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (user && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Preparando dashboard...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const pieData = [
    { name: "Necessidades", value: monthlyData.necessidades, color: COLORS.necessidades },
    { name: "Desejos", value: monthlyData.desejos, color: COLORS.desejos },
    { name: "Poupança", value: monthlyData.poupanca, color: COLORS.poupanca },
  ].filter((item) => item.value > 0)

  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  const alert = getAlert()

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Bem-vindo, {profile?.name} - {profile?.family?.name}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) => setSelectedMonth(Number.parseInt(value))}
            >
              <SelectTrigger className="w-32">
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
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
                        fill={(entry: any) => COLORS[entry.classification as keyof typeof COLORS] || "#8884d8"}
                      />
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
          <Button variant="outline" onClick={() => router.push("/family")} className="h-16">
            <Users className="w-5 h-5 mr-2" />
            Gerenciar Família
          </Button>
          <Button variant="outline" onClick={() => router.push("/budget")} className="h-16">
            <Target className="w-5 h-5 mr-2" />
            Orçamento
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/investments")}
            className="h-16 sm:col-span-2 lg:col-span-1"
          >
            <DollarSign className="w-5 h-5 mr-2" />
            Investimentos
          </Button>
        </div>
      </div>
    </div>
  )
}
