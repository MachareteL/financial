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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Plus, Edit, Trash2, ArrowLeft, TrendingUp, DollarSign, Target, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getUserProfile } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"

interface Investment {
  id: string
  name: string
  type: string
  initial_amount: number
  current_amount: number
  monthly_contribution: number
  annual_return_rate: number
  start_date: string
  created_at: string
}

interface ProjectionData {
  month: string
  value: number
  contributions: number
  returns: number
}

export default function InvestmentsPage() {
  const { user, loading } = useAuth()
  const [investments, setInvestments] = useState<Investment[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null)
  const [projectionData, setProjectionData] = useState<ProjectionData[]>([])
  const [projectionYears, setProjectionYears] = useState(5)
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
      loadInvestments()
    }
  }, [profile])

  useEffect(() => {
    if (investments.length > 0) {
      calculateProjections()
    }
  }, [investments, projectionYears])

  const loadProfile = async () => {
    try {
      const userProfile = await getUserProfile()
      if (!userProfile) {
        router.push("/auth")
        return
      }
      setProfile(userProfile)
    } catch (error) {
      console.error("Error loading profile:", error)
      router.push("/auth")
    }
  }

  const loadInvestments = async () => {
    if (!profile?.family_id) return

    try {
      const { data, error } = await supabase
        .from("investments")
        .select("*")
        .eq("family_id", profile.family_id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setInvestments(data || [])
    } catch (error: any) {
      toast({
        title: "Erro ao carregar investimentos",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const calculateProjections = () => {
    const totalMonths = projectionYears * 12
    const projections: ProjectionData[] = []

    let totalValue = investments.reduce((sum, inv) => sum + inv.current_amount, 0)
    let totalContributions = investments.reduce((sum, inv) => sum + inv.initial_amount, 0)
    let totalReturns = totalValue - totalContributions

    for (let month = 0; month <= totalMonths; month++) {
      if (month > 0) {
        // Add monthly contributions
        const monthlyContribution = investments.reduce((sum, inv) => sum + inv.monthly_contribution, 0)
        totalValue += monthlyContribution
        totalContributions += monthlyContribution

        // Apply monthly returns
        const monthlyReturn = investments.reduce((sum, inv) => {
          const monthlyRate = inv.annual_return_rate / 100 / 12
          const currentInvestmentValue =
            inv.current_amount + inv.monthly_contribution * month + (totalReturns * inv.current_amount) / totalValue
          return sum + currentInvestmentValue * monthlyRate
        }, 0)

        totalValue += monthlyReturn
        totalReturns += monthlyReturn
      }

      projections.push({
        month: `${Math.floor(month / 12)}a ${month % 12}m`,
        value: totalValue,
        contributions: totalContributions,
        returns: totalReturns,
      })
    }

    setProjectionData(projections)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const type = formData.get("type") as string
    const initialAmount = Number.parseFloat(formData.get("initialAmount") as string)
    const currentAmount = Number.parseFloat(formData.get("currentAmount") as string)
    const monthlyContribution = Number.parseFloat(formData.get("monthlyContribution") as string)
    const annualReturnRate = Number.parseFloat(formData.get("annualReturnRate") as string)
    const startDate = formData.get("startDate") as string

    try {
      const investmentData = {
        name,
        type,
        initial_amount: initialAmount,
        current_amount: currentAmount,
        monthly_contribution: monthlyContribution,
        annual_return_rate: annualReturnRate,
        start_date: startDate,
        family_id: profile.family_id,
      }

      if (editingInvestment) {
        const { error } = await supabase.from("investments").update(investmentData).eq("id", editingInvestment.id)
        if (error) throw error
        toast({ title: "Investimento atualizado com sucesso!" })
      } else {
        const { error } = await supabase.from("investments").insert(investmentData)
        if (error) throw error
        toast({ title: "Investimento adicionado com sucesso!" })
      }

      setIsDialogOpen(false)
      setEditingInvestment(null)
      loadInvestments()
    } catch (error: any) {
      toast({
        title: "Erro ao salvar investimento",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteInvestment = async (id: string) => {
    try {
      const { error } = await supabase.from("investments").delete().eq("id", id)
      if (error) throw error
      toast({ title: "Investimento excluído com sucesso!" })
      loadInvestments()
    } catch (error: any) {
      toast({
        title: "Erro ao excluir investimento",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const getInvestmentTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      savings: "Poupança",
      stocks: "Ações",
      bonds: "Títulos",
      real_estate: "Imóveis",
      crypto: "Criptomoedas",
      other: "Outros",
    }
    return types[type] || type
  }

  const getInvestmentTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      savings: "bg-green-100 text-green-800",
      stocks: "bg-blue-100 text-blue-800",
      bonds: "bg-purple-100 text-purple-800",
      real_estate: "bg-orange-100 text-orange-800",
      crypto: "bg-yellow-100 text-yellow-800",
      other: "bg-gray-100 text-gray-800",
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.current_amount, 0)
  const totalInitialValue = investments.reduce((sum, inv) => sum + inv.initial_amount, 0)
  const totalMonthlyContribution = investments.reduce((sum, inv) => sum + inv.monthly_contribution, 0)
  const totalReturns = totalCurrentValue - totalInitialValue
  const averageReturn = totalInitialValue > 0 ? (totalReturns / totalInitialValue) * 100 : 0

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
            <h1 className="text-3xl font-bold text-gray-900">Investimentos</h1>
            <p className="text-gray-600">Gerencie seus investimentos e veja projeções futuras</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingInvestment(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Investimento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingInvestment ? "Editar Investimento" : "Novo Investimento"}</DialogTitle>
                <DialogDescription>
                  {editingInvestment ? "Atualize os dados do investimento" : "Adicione um novo investimento"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Investimento</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ex: Tesouro Direto, Ações PETR4..."
                    defaultValue={editingInvestment?.name || ""}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select name="type" defaultValue={editingInvestment?.type || ""} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="savings">Poupança</SelectItem>
                      <SelectItem value="stocks">Ações</SelectItem>
                      <SelectItem value="bonds">Títulos</SelectItem>
                      <SelectItem value="real_estate">Imóveis</SelectItem>
                      <SelectItem value="crypto">Criptomoedas</SelectItem>
                      <SelectItem value="other">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="initialAmount">Valor Inicial (R$)</Label>
                    <Input
                      id="initialAmount"
                      name="initialAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={editingInvestment?.initial_amount || ""}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentAmount">Valor Atual (R$)</Label>
                    <Input
                      id="currentAmount"
                      name="currentAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={editingInvestment?.current_amount || ""}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyContribution">Aporte Mensal (R$)</Label>
                  <Input
                    id="monthlyContribution"
                    name="monthlyContribution"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={editingInvestment?.monthly_contribution || "0"}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annualReturnRate">Rendimento Anual (%)</Label>
                  <Input
                    id="annualReturnRate"
                    name="annualReturnRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    defaultValue={editingInvestment?.annual_return_rate || ""}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Data de Início</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    defaultValue={editingInvestment?.start_date || new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? "Salvando..." : editingInvestment ? "Atualizar" : "Adicionar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {totalCurrentValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retorno Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalReturns >= 0 ? "text-green-600" : "text-red-600"}`}>
                R$ {totalReturns.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">{averageReturn.toFixed(2)}% de retorno</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aporte Mensal</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {totalMonthlyContribution.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investimentos</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{investments.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Projection Chart */}
        {projectionData.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Projeção de Crescimento</CardTitle>
                  <CardDescription>Evolução dos investimentos ao longo do tempo</CardDescription>
                </div>
                <Select
                  value={projectionYears.toString()}
                  onValueChange={(value) => setProjectionYears(Number.parseInt(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 ano</SelectItem>
                    <SelectItem value="3">3 anos</SelectItem>
                    <SelectItem value="5">5 anos</SelectItem>
                    <SelectItem value="10">10 anos</SelectItem>
                    <SelectItem value="20">20 anos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projectionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                        name === "value" ? "Valor Total" : name === "contributions" ? "Aportes" : "Rendimentos",
                      ]}
                    />
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} name="value" />
                    <Line
                      type="monotone"
                      dataKey="contributions"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="contributions"
                    />
                    <Line type="monotone" dataKey="returns" stroke="#f59e0b" strokeWidth={2} name="returns" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Valor Total</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Aportes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="text-sm">Rendimentos</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Investments List */}
        <div className="space-y-4">
          {investments.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500 mb-4">Nenhum investimento encontrado.</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Investimento
                </Button>
              </CardContent>
            </Card>
          ) : (
            investments.map((investment) => {
              const returns = investment.current_amount - investment.initial_amount
              const returnPercentage = investment.initial_amount > 0 ? (returns / investment.initial_amount) * 100 : 0

              return (
                <Card key={investment.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{investment.name}</h3>
                          <Badge className={getInvestmentTypeColor(investment.type)}>
                            {getInvestmentTypeLabel(investment.type)}
                          </Badge>
                          <Badge variant={returns >= 0 ? "default" : "destructive"}>
                            {returnPercentage >= 0 ? "+" : ""}
                            {returnPercentage.toFixed(2)}%
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Valor Atual</p>
                            <p className="font-medium">
                              R$ {investment.current_amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Retorno</p>
                            <p className={`font-medium ${returns >= 0 ? "text-green-600" : "text-red-600"}`}>
                              R$ {returns.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Aporte Mensal</p>
                            <p className="font-medium">
                              R$ {investment.monthly_contribution.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Rendimento Anual</p>
                            <p className="font-medium">{investment.annual_return_rate}%</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingInvestment(investment)
                            setIsDialogOpen(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm("Tem certeza que deseja excluir este investimento?")) {
                              deleteInvestment(investment.id)
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
