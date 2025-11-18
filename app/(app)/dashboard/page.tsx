"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Plus, TrendingUp, LogOut, Users, Tag, Target, DollarSign, Wallet, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/app/auth/auth-provider"
import { getDashboardDataUseCase, signOutUseCase } from "@/infrastructure/dependency-injection" 
import type { DashboardDataDTO, DashboardFolderData, DashboardExpenseChartData } from "@/domain/dto/dashboard.types.d.ts"

// Definição de cores (pode ser movida para um util)
const COLORS: Record<string, string> = {
  Necessidades: "#10b981", // Verde
  Desejos: "#f59e0b",      // Amarelo/Laranja
  Poupança: "#3b82f6",     // Azul
  Padrão: "#8884d8",       // Roxo Padrão (recharts)
}

const getFolderColor = (folderName: string) => {
  return COLORS[folderName] || COLORS['Padrão'];
}

export default function DashboardPage() {
  const { session, loading: authLoading } = useAuth()
  const router = useRouter()

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  // Estados para os dados dinâmicos
  const [expenseChartData, setExpenseChartData] = useState<DashboardExpenseChartData[]>([])
  const [folderData, setFolderData] = useState<DashboardFolderData[]>([])
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalSpent, setTotalSpent] = useState(0)
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
        const data = await getDashboardDataUseCase.execute(teamId, selectedMonth, selectedYear)
        
        setExpenseChartData(data.expenseChartData)
        setFolderData(data.folders)
        setTotalIncome(data.totalIncome)
        setTotalSpent(data.totalSpent)
        
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

  // --- Memos para os Gráficos ---
  const pieData = useMemo(() => {
    return folderData
      .map(folder => ({
        name: folder.name,
        value: folder.spent,
        color: getFolderColor(folder.name),
      }))
      .filter((item) => item.value > 0)
  }, [folderData])
  
  const barData = useMemo(() => {
    return expenseChartData.map(item => ({
      ...item,
      fill: getFolderColor(item.budCategoryName),
    }))
  }, [expenseChartData])
  
  const months = useMemo(() => [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ], []);

  // --- Renderização de Loading ---
  if (authLoading || !session || !teamId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-gray-900 mx-auto" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header (com loading no Select) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Bem-vindo, {session.user.name} - {session.teams[0].team.name}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
             {isLoadingData && (
              <Loader2 className="animate-spin h-5 w-5 text-gray-500" />
            )}
            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) => setSelectedMonth(Number.parseInt(value))}
              disabled={isLoadingData}
            >
              <SelectTrigger className="w-32" loading={isLoadingData}>
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
            <Select 
              value={selectedYear.toString()} 
              onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
              disabled={isLoadingData}
            >
              <SelectTrigger className="w-24" loading={isLoadingData}>
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

        {/* Cards de Resumo Principais (Refatorados) */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-opacity ${isLoadingData ? 'opacity-50' : 'opacity-100'}`}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Planejada</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-500">
                {totalIncome > 0 ? "Definido no Orçamento" : "Orçamento não definido"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {totalSpent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-500">
                {totalIncome > 0 ? `${((totalSpent / totalIncome) * 100).toFixed(0)}% da receita` : ""}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo (Receita - Gasto)</CardTitle>
              <Wallet className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${(totalIncome - totalSpent) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                R$ {(totalIncome - totalSpent).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
               <p className="text-xs text-gray-500">
                {totalIncome > 0 ? `${(((totalIncome - totalSpent) / totalIncome) * 100).toFixed(0)}% restante` : ""}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cards Dinâmicos por "Pasta" */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-opacity ${isLoadingData ? 'opacity-50' : 'opacity-100'}`}>
          {folderData.map((folder) => (
             <Card key={folder.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                   <CardTitle className="text-sm font-medium">{folder.name}</CardTitle>
                   <span className="text-xs text-muted-foreground">Meta: {(folder.percentage * 100).toFixed(0)}%</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: getFolderColor(folder.name) }}>
                  R$ {folder.spent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  de R$ {folder.budgeted.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} planejados
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Gráficos */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-opacity ${isLoadingData ? 'opacity-50' : 'opacity-100'}`}>
          {/* Gráfico de Pizza (Gastos por "Pasta") */}
          <Card>
            <CardHeader>
              <CardTitle>Gastos por Pasta</CardTitle>
              <CardDescription>Distribuição dos gastos por pasta de orçamento</CardDescription>
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
                        label={({ name, percent }) => `${name} ${((Number(percent ?? 0) * 100)).toFixed(0)}%`}
                        outerRadius={100}
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

          {/* Gráfico de Barras (Gastos por Categoria) */}
          <Card>
            <CardHeader>
              <CardTitle>Gastos por Categoria</CardTitle>
              <CardDescription>Distribuição dos gastos por categoria (de gasto)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} dx={-5} />
                      <Tooltip
                        formatter={(value: number) => [
                          `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                          "Valor",
                        ]}
                      />
                      <Bar
                        dataKey="amount"
                        background={{ fill: '#eee' }}
                      >
                        {barData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
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