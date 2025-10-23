"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Edit, Trash2, Plus, Receipt, Eye, Search, Filter, Calendar, Tag } from "lucide-react"
import {
  getExpensesUseCase,
  getCategoriesUseCase,
  deleteExpenseUseCase,
} from "@/infrastructure/dependency-injection"
import { getUserProfile } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/app/auth/auth-provider"
import type { ExpenseWithDetails } from "@/domain/entities/expense"
import type { Category } from "@/domain/entities/expense"

export default function ExpensesPage() {
  const { user, loading } = useAuth()
  const [expenses, setExpenses] = useState<ExpenseWithDetails[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<ExpenseWithDetails[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null)

  // Filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedClassification, setSelectedClassification] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date-desc")

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
      loadExpenses()
      loadCategories()
    }
  }, [profile])

  useEffect(() => {
    applyFilters()
  }, [expenses, searchTerm, selectedMonth, selectedYear, selectedCategory, selectedClassification, sortBy])

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

  const loadExpenses = async () => {
    if (!profile?.familyId) return

    setIsLoading(true)
    try {
      const data = await getExpensesUseCase.execute({ familyId: profile.familyId })
      setExpenses(data)
    } catch (error: any) {
      toast({
        title: "Erro ao carregar gastos",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadCategories = async () => {
    if (!profile?.familyId) return

    try {
      const data = await getCategoriesUseCase.execute({ familyId: profile.familyId })
      setCategories(data)
    } catch (error: any) {
      console.error("Error loading categories:", error)
    }
  }

  const applyFilters = () => {
    let filtered = [...expenses]

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(
        (expense) =>
          expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          expense.category.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtro por mês
    if (selectedMonth !== "all") {
      filtered = filtered.filter((expense) => {
        const expenseMonth = expense.date.getMonth() + 1
        return expenseMonth.toString() === selectedMonth
      })
    }

    // Filtro por ano
    if (selectedYear !== "all") {
      filtered = filtered.filter((expense) => {
        const expenseYear = expense.date.getFullYear()
        return expenseYear.toString() === selectedYear
      })
    }

    // Filtro por categoria
    if (selectedCategory !== "all") {
      filtered = filtered.filter((expense) => expense.category.id === selectedCategory)
    }

    // Filtro por classificação
    if (selectedClassification !== "all") {
      filtered = filtered.filter((expense) => expense.category.classification === selectedClassification)
    }

    // Ordenação
    switch (sortBy) {
      case "date-desc":
        filtered.sort((a, b) => b.date.getTime() - a.date.getTime())
        break
      case "date-asc":
        filtered.sort((a, b) => a.date.getTime() - b.date.getTime())
        break
      case "amount-desc":
        filtered.sort((a, b) => b.amount - a.amount)
        break
      case "amount-asc":
        filtered.sort((a, b) => a.amount - b.amount)
        break
      case "category":
        filtered.sort((a, b) => a.category.name.localeCompare(b.category.name))
        break
    }

    setFilteredExpenses(filtered)
  }

  const deleteExpense = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este gasto?")) return

    try {
      await deleteExpenseUseCase.execute({ expenseId: id, familyId: profile.familyId })
      setExpenses(expenses.filter((expense) => expense.id !== id))
      toast({
        title: "Gasto excluído",
        description: "O gasto foi excluído com sucesso.",
      })
    } catch (error: any) {
      toast({
        title: "Erro ao excluir gasto",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedMonth("all")
    setSelectedYear("all")
    setSelectedCategory("all")
    setSelectedClassification("all")
    setSortBy("date-desc")
  }

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case "necessidades":
        return "bg-green-100 text-green-800"
      case "desejos":
        return "bg-yellow-100 text-yellow-800"
      case "poupanca":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR")
  }

  const getMonths = () => {
    return [
      { value: "1", label: "Janeiro" },
      { value: "2", label: "Fevereiro" },
      { value: "3", label: "Março" },
      { value: "4", label: "Abril" },
      { value: "5", label: "Maio" },
      { value: "6", label: "Junho" },
      { value: "7", label: "Julho" },
      { value: "8", label: "Agosto" },
      { value: "9", label: "Setembro" },
      { value: "10", label: "Outubro" },
      { value: "11", label: "Novembro" },
      { value: "12", label: "Dezembro" },
    ]
  }

  const getYears = () => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push({ value: i.toString(), label: i.toString() })
    }
    return years
  }

  const getTotalAmount = () => {
    return filteredExpenses.reduce((total, expense) => total + expense.amount, 0)
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Carregando gastos...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gastos</h1>
              <p className="text-gray-600">
                Gerencie todos os gastos da família • {filteredExpenses.length} gastos • Total: R${" "}
                {getTotalAmount().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <Button onClick={() => router.push("/expenses/new")}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Gasto
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Busca */}
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="Descrição ou categoria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Mês */}
              <div className="space-y-2">
                <Label>Mês</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Todos os meses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os meses</SelectItem>
                    {getMonths().map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ano */}
              <div className="space-y-2">
                <Label>Ano</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Todos os anos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os anos</SelectItem>
                    {getYears().map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <Tag className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Classificação */}
              <div className="space-y-2">
                <Label>Classificação</Label>
                <Select value={selectedClassification} onValueChange={setSelectedClassification}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as classificações" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as classificações</SelectItem>
                    <SelectItem value="necessidades">Necessidades</SelectItem>
                    <SelectItem value="desejos">Desejos</SelectItem>
                    <SelectItem value="poupanca">Poupança</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ordenação */}
              <div className="space-y-2">
                <Label>Ordenar por</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Data (mais recente)</SelectItem>
                    <SelectItem value="date-asc">Data (mais antigo)</SelectItem>
                    <SelectItem value="amount-desc">Valor (maior)</SelectItem>
                    <SelectItem value="amount-asc">Valor (menor)</SelectItem>
                    <SelectItem value="category">Categoria (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Limpar filtros */}
              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs para diferentes visualizações */}
        <Tabs defaultValue="cards" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="table">Tabela</TabsTrigger>
            <TabsTrigger value="summary">Resumo</TabsTrigger>
          </TabsList>

          {/* Cards View */}
          <TabsContent value="cards" className="space-y-4">
            {filteredExpenses.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Receipt className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {expenses.length === 0 ? "Nenhum gasto encontrado" : "Nenhum gasto corresponde aos filtros"}
                  </h3>
                  <p className="text-gray-600 text-center mb-4">
                    {expenses.length === 0
                      ? "Comece adicionando seu primeiro gasto para acompanhar suas finanças."
                      : "Tente ajustar os filtros para encontrar os gastos desejados."}
                  </p>
                  {expenses.length === 0 && (
                    <Button onClick={() => router.push("/expenses/new")}>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Primeiro Gasto
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExpenses.map((expense) => (
                  <Card key={expense.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          R$ {expense.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </CardTitle>
                        <Badge className={getClassificationColor(expense.category.classification)}>
                          {expense.category.classification}
                        </Badge>
                      </div>
                      <CardDescription>{expense.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Categoria: {expense.category.name}</span>
                        <span>{formatDate(expense.date)}</span>
                      </div>
                      <div className="text-sm text-gray-600">Adicionado por: {expense.user.name}</div>
                      {expense.receiptUrl && (
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedReceipt(expense.receiptUrl!)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Ver Nota
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Nota Fiscal</DialogTitle>
                              </DialogHeader>
                              <div className="flex justify-center">
                                <img
                                  src={expense.receiptUrl || "/placeholder.svg"}
                                  alt="Nota fiscal"
                                  className="max-w-full max-h-96 object-contain"
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/expenses/${expense.id}/edit`)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteExpense(expense.id)}
                          className="flex-1"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Table View */}
          <TabsContent value="table" className="space-y-4">
            {filteredExpenses.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Receipt className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {expenses.length === 0 ? "Nenhum gasto encontrado" : "Nenhum gasto corresponde aos filtros"}
                  </h3>
                  <p className="text-gray-600 text-center mb-4">
                    {expenses.length === 0
                      ? "Comece adicionando seu primeiro gasto para acompanhar suas finanças."
                      : "Tente ajustar os filtros para encontrar os gastos desejados."}
                  </p>
                  {expenses.length === 0 && (
                    <Button onClick={() => router.push("/expenses/new")}>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Primeiro Gasto
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Lista de Gastos</CardTitle>
                  <CardDescription>Visualização em tabela de todos os gastos filtrados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">Data</th>
                          <th className="text-left p-3 font-medium">Valor</th>
                          <th className="text-left p-3 font-medium">Categoria</th>
                          <th className="text-left p-3 font-medium">Descrição</th>
                          <th className="text-left p-3 font-medium">Adicionado por</th>
                          <th className="text-left p-3 font-medium">Nota</th>
                          <th className="text-left p-3 font-medium">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredExpenses.map((expense) => (
                          <tr key={expense.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">{formatDate(expense.date)}</td>
                            <td className="p-3 font-medium">
                              R$ {expense.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-3">
                              <div className="flex flex-col gap-1">
                                <span className="font-medium">{expense.category.name}</span>
                                <Badge
                                  className={`${getClassificationColor(expense.category.classification)} text-xs w-fit`}
                                >
                                  {expense.category.classification}
                                </Badge>
                              </div>
                            </td>
                            <td className="p-3 max-w-xs truncate">{expense.description}</td>
                            <td className="p-3">{expense.user.name}</td>
                            <td className="p-3">
                              {expense.receiptUrl ? (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Nota Fiscal</DialogTitle>
                                    </DialogHeader>
                                    <div className="flex justify-center">
                                      <img
                                        src={expense.receiptUrl || "/placeholder.svg"}
                                        alt="Nota fiscal"
                                        className="max-w-full max-h-96 object-contain"
                                      />
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="flex gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/expenses/${expense.id}/edit`)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => deleteExpense(expense.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Summary View */}
          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total por classificação */}
              {["necessidades", "desejos", "poupanca"].map((classification) => {
                const total = filteredExpenses
                  .filter((expense) => expense.category.classification === classification)
                  .reduce((sum, expense) => sum + expense.amount, 0)
                const count = filteredExpenses.filter(
                  (expense) => expense.category.classification === classification,
                ).length

                return (
                  <Card key={classification}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium capitalize">{classification}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{count} gastos</p>
                    </CardContent>
                  </Card>
                )
              })}

              {/* Total geral */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Geral</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {getTotalAmount().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{filteredExpenses.length} gastos</p>
                </CardContent>
              </Card>
            </div>

            {/* Gastos por categoria */}
            <Card>
              <CardHeader>
                <CardTitle>Gastos por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map((category) => {
                    const categoryExpenses = filteredExpenses.filter((expense) => expense.category.id === category.id)
                    const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0)
                    const percentage = getTotalAmount() > 0 ? (total / getTotalAmount()) * 100 : 0

                    if (total === 0) return null

                    return (
                      <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge className={getClassificationColor(category.classification)}>
                            {category.classification}
                          </Badge>
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-sm text-gray-600">
                            {percentage.toFixed(1)}% • {categoryExpenses.length} gastos
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
