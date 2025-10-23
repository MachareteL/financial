"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, ArrowLeft, DollarSign, TrendingUp, Target, Calendar } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/app/auth/auth-provider"
import {
  getCurrentUserUseCase,
  getIncomesUseCase,
  createIncomeUseCase,
  updateIncomeUseCase,
  deleteIncomeUseCase,
  getBudgetUseCase,
  saveBudgetUseCase,
  getMonthlyExpensesUseCase,
} from "@/infrastructure/dependency-injection"

interface Income {
  id: string
  amount: number
  description: string
  type: "recurring" | "one_time"
  frequency?: "monthly" | "weekly" | "yearly"
  date: string
  userId: string
  userName: string | null
}

interface Budget {
  id: string
  month: number
  year: number
  necessidadesBudget: number
  desejosBudget: number
  poupancaBudget: number
  totalIncome: number
}

interface MonthlyExpenses {
  necessidades: number
  desejos: number
  poupanca: number
  total: number
}

export default function BudgetPage() {
  const { user, loading } = useAuth()
  const [incomes, setIncomes] = useState<Income[]>([])
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null)
  const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyExpenses>({
    necessidades: 0,
    desejos: 0,
    poupanca: 0,
    total: 0,
  })
  const [profile, setProfile] = useState<any>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isLoading, setIsLoading] = useState(false)
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false)
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
      return
    }

    if (user && !profile) {
      loadProfile()
    }
  }, [user, loading, router])

  useEffect(() => {
    if (profile) {
      loadIncomes()
      loadBudget()
      loadMonthlyExpenses()
    }
  }, [profile, selectedMonth, selectedYear])

  const loadProfile = async () => {
    try {
      const userProfile = await getCurrentUserUseCase.execute()

      if (!userProfile) {
        router.push("/auth")
        return
      }
      setProfile(userProfile)
    } catch (error) {
      console.error("[v0] Error loading profile:", error)
      router.push("/auth")
    }
  }

  const loadIncomes = async () => {
    if (!profile?.familyId) {
      console.log("[v0] No familyId found in profile:", profile)
      return
    }

    try {
      const incomesData = await getIncomesUseCase.execute({ familyId: profile.familyId })

      const incomesWithStringDates = incomesData.map((income) => ({
        ...income,
        date: income.date instanceof Date ? income.date.toISOString().split("T")[0] : income.date,
      }))

      setIncomes(incomesWithStringDates)
      console.log("[v0] Loaded incomes:", incomesWithStringDates.length)
    } catch (error: any) {
      console.error("[v0] Error loading incomes:", error)
      toast({
        title: "Erro ao carregar receitas",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const loadBudget = async () => {
    if (!profile?.familyId) return

    try {
      const budgetData = await getBudgetUseCase.execute({
        familyId: profile.familyId,
        month: selectedMonth,
        year: selectedYear,
      })

      setCurrentBudget(budgetData)
      console.log("[v0] Loaded budget:", budgetData)
    } catch (error: any) {
      console.error("[v0] Error loading budget:", error)
      toast({
        title: "Erro ao carregar orçamento",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const loadMonthlyExpenses = async () => {
    if (!profile?.familyId) return

    try {
      const expenses = await getMonthlyExpensesUseCase.execute({
        familyId: profile.familyId,
        month: selectedMonth,
        year: selectedYear,
      })

      setMonthlyExpenses(expenses)
      console.log("[v0] Loaded monthly expenses:", expenses)
    } catch (error: any) {
      console.error("[v0] Error loading monthly expenses:", error)
      toast({
        title: "Erro ao carregar gastos",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleIncomeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const amount = Number.parseFloat(formData.get("amount") as string)
    const description = formData.get("description") as string
    const type = formData.get("type") as "recurring" | "one_time"
    const frequency = formData.get("frequency") as "monthly" | "weekly" | "yearly" | undefined
    const date = formData.get("date") as string

    try {
      if (editingIncome) {
        await updateIncomeUseCase.execute({
          id: editingIncome.id,
          amount,
          description,
          type,
          frequency: type === "recurring" ? frequency : undefined,
          date: new Date(date),
        })
        toast({ title: "Receita atualizada com sucesso!" })
      } else {
        await createIncomeUseCase.execute({
          amount,
          description,
          type,
          frequency: type === "recurring" ? frequency : undefined,
          date: new Date(date),
          familyId: profile.familyId,
          userId: profile.id,
        })
        toast({ title: "Receita adicionada com sucesso!" })
      }

      setIsIncomeDialogOpen(false)
      setEditingIncome(null)
      loadIncomes()
    } catch (error: any) {
      console.error("[v0] Error saving income:", error)
      toast({
        title: "Erro ao salvar receita",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBudgetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const totalIncome = monthlyIncome
    const necessidadesBudget = totalIncome * 0.5
    const desejosBudget = totalIncome * 0.3
    const poupancaBudget = totalIncome * 0.2

    try {
      await saveBudgetUseCase.execute({
        familyId: profile.familyId,
        month: selectedMonth,
        year: selectedYear,
        totalIncome,
        necessidadesBudget,
        desejosBudget,
        poupancaBudget,
      })

      toast({ title: "Orçamento salvo com sucesso!" })
      setIsBudgetDialogOpen(false)
      loadBudget()
    } catch (error: any) {
      console.error("[v0] Error saving budget:", error)
      toast({
        title: "Erro ao salvar orçamento",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteIncome = async (id: string) => {
    try {
      await deleteIncomeUseCase.execute({ id })

      toast({ title: "Receita excluída com sucesso!" })
      loadIncomes()
    } catch (error: any) {
      console.error("[v0] Error deleting income:", error)
      toast({
        title: "Erro ao excluir receita",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const calculateMonthlyIncome = () => {
    return incomes
      .filter((income) => {
        if (income.type === "one_time") {
          const incomeDate = new Date(income.date)
          return incomeDate.getMonth() + 1 === selectedMonth && incomeDate.getFullYear() === selectedYear
        }
        return income.type === "recurring" && income.frequency === "monthly"
      })
      .reduce((total, income) => total + income.amount, 0)
  }

  const getBudgetProgress = (category: keyof MonthlyExpenses, budgetAmount: number) => {
    if (budgetAmount === 0) return 0
    return Math.min((monthlyExpenses[category] / budgetAmount) * 100, 100)
  }

  const getBudgetStatus = (spent: number, budget: number) => {
    if (budget === 0) return "neutral"
    const percentage = (spent / budget) * 100
    if (percentage <= 80) return "good"
    if (percentage <= 100) return "warning"
    return "danger"
  }

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

  const monthlyIncome = calculateMonthlyIncome()

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Carregando...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Orçamento</h1>
            <p className="text-gray-600">Gerencie suas receitas e orçamento mensal</p>
          </div>
          <div className="flex gap-2">
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
          </div>
        </div>

        <Tabs defaultValue="budget" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="budget">Orçamento</TabsTrigger>
            <TabsTrigger value="income">Receitas</TabsTrigger>
          </TabsList>

          <TabsContent value="budget" className="space-y-6">
            {/* Budget Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    R$ {monthlyIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Orçamento Total</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R${" "}
                    {(
                      (currentBudget?.necessidadesBudget || 0) +
                      (currentBudget?.desejosBudget || 0) +
                      (currentBudget?.poupancaBudget || 0)
                    ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Gasto Total</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {monthlyExpenses.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Saldo</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${
                      monthlyIncome - monthlyExpenses.total >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    R$ {(monthlyIncome - monthlyExpenses.total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Budget Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-green-700">Necessidades (50%)</CardTitle>
                  <CardDescription>Moradia, alimentação, transporte</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Gasto:</span>
                    <span>R$ {monthlyExpenses.necessidades.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Orçamento:</span>
                    <span>
                      R${" "}
                      {(currentBudget?.necessidadesBudget || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <Progress
                    value={getBudgetProgress("necessidades", currentBudget?.necessidadesBudget || 0)}
                    className="h-2"
                  />
                  <Badge
                    variant={
                      getBudgetStatus(monthlyExpenses.necessidades, currentBudget?.necessidadesBudget || 0) === "good"
                        ? "default"
                        : getBudgetStatus(monthlyExpenses.necessidades, currentBudget?.necessidadesBudget || 0) ===
                            "warning"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {getBudgetProgress("necessidades", currentBudget?.necessidadesBudget || 0).toFixed(1)}% usado
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-amber-700">Desejos (30%)</CardTitle>
                  <CardDescription>Lazer, entretenimento, compras</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Gasto:</span>
                    <span>R$ {monthlyExpenses.desejos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Orçamento:</span>
                    <span>
                      R$ {(currentBudget?.desejosBudget || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <Progress value={getBudgetProgress("desejos", currentBudget?.desejosBudget || 0)} className="h-2" />
                  <Badge
                    variant={
                      getBudgetStatus(monthlyExpenses.desejos, currentBudget?.desejosBudget || 0) === "good"
                        ? "default"
                        : getBudgetStatus(monthlyExpenses.desejos, currentBudget?.desejosBudget || 0) === "warning"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {getBudgetProgress("desejos", currentBudget?.desejosBudget || 0).toFixed(1)}% usado
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-blue-700">Poupança (20%)</CardTitle>
                  <CardDescription>Investimentos, reserva de emergência</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Gasto:</span>
                    <span>R$ {monthlyExpenses.poupanca.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Orçamento:</span>
                    <span>
                      R$ {(currentBudget?.poupancaBudget || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <Progress value={getBudgetProgress("poupanca", currentBudget?.poupancaBudget || 0)} className="h-2" />
                  <Badge
                    variant={
                      getBudgetStatus(monthlyExpenses.poupanca, currentBudget?.poupancaBudget || 0) === "good"
                        ? "default"
                        : getBudgetStatus(monthlyExpenses.poupanca, currentBudget?.poupancaBudget || 0) === "warning"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {getBudgetProgress("poupanca", currentBudget?.poupancaBudget || 0).toFixed(1)}% usado
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Set Budget Button */}
            <div className="flex justify-center">
              <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <Target className="w-4 h-4 mr-2" />
                    {currentBudget ? "Atualizar Orçamento" : "Gerar Orçamento"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Definir Orçamento Mensal</DialogTitle>
                    <DialogDescription>
                      Orçamento baseado nas suas receitas para {months[selectedMonth - 1]} de {selectedYear}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleBudgetSubmit} className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                      <h4 className="font-medium text-gray-900">Receita Total Calculada</h4>
                      <p className="text-2xl font-bold text-blue-700">
                        R$ {monthlyIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-gray-600">Baseado nas suas receitas recorrentes e pontuais do mês</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <h4 className="font-medium text-gray-900">Distribuição Automática (50/30/20)</h4>
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Necessidades (50%)</span>
                          <span className="font-medium text-green-700">
                            R$ {(monthlyIncome * 0.5).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Desejos (30%)</span>
                          <span className="font-medium text-amber-700">
                            R$ {(monthlyIncome * 0.3).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Poupança (20%)</span>
                          <span className="font-medium text-blue-700">
                            R$ {(monthlyIncome * 0.2).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {monthlyIncome === 0 && (
                      <div className="bg-amber-50 p-4 rounded-lg">
                        <p className="text-amber-800 text-sm">
                          ⚠️ Você precisa adicionar receitas antes de definir o orçamento. Vá para a aba "Receitas" e
                          adicione suas fontes de renda.
                        </p>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsBudgetDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isLoading || monthlyIncome === 0} className="flex-1">
                        {isLoading ? "Salvando..." : "Confirmar Orçamento"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>

          <TabsContent value="income" className="space-y-6">
            {/* Add Income Button */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Receitas</h2>
                <p className="text-gray-600">Gerencie suas fontes de renda</p>
              </div>
              <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingIncome(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Receita
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingIncome ? "Editar Receita" : "Nova Receita"}</DialogTitle>
                    <DialogDescription>
                      {editingIncome ? "Atualize os dados da receita" : "Adicione uma nova fonte de renda"}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleIncomeSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Valor (R$)</Label>
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={editingIncome?.amount || ""}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Input
                        id="description"
                        name="description"
                        placeholder="Ex: Salário, Freelance, Venda..."
                        defaultValue={editingIncome?.description || ""}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo</Label>
                      <Select name="type" defaultValue={editingIncome?.type || ""} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recurring">Recorrente</SelectItem>
                          <SelectItem value="one_time">Única vez</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequência (apenas para recorrente)</Label>
                      <Select name="frequency" defaultValue={editingIncome?.frequency || ""}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a frequência" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Mensal</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="yearly">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Data</Label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        defaultValue={editingIncome?.date || new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsIncomeDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isLoading} className="flex-1">
                        {isLoading ? "Salvando..." : editingIncome ? "Atualizar" : "Adicionar"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Incomes List */}
            <div className="space-y-4">
              {incomes.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-gray-500 mb-4">Nenhuma receita encontrada.</p>
                    <Button onClick={() => setIsIncomeDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Primeira Receita
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                incomes.map((income) => (
                  <Card key={income.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">
                              R$ {income.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </h3>
                            <Badge variant={income.type === "recurring" ? "default" : "secondary"}>
                              {income.type === "recurring" ? "Recorrente" : "Única vez"}
                            </Badge>
                            {income.frequency && (
                              <Badge variant="outline">
                                {income.frequency === "monthly"
                                  ? "Mensal"
                                  : income.frequency === "weekly"
                                    ? "Semanal"
                                    : "Anual"}
                              </Badge>
                            )}
                          </div>

                          <p className="text-gray-900 mb-1">{income.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(income.date).toLocaleDateString("pt-BR")} • Adicionado por{" "}
                            {income.userName || "Desconhecido"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingIncome(income)
                              setIsIncomeDialogOpen(true)
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm("Tem certeza que deseja excluir esta receita?")) {
                                deleteIncome(income.id)
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
