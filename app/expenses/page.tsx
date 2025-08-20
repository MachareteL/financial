"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Search, Eye, Edit, Trash2, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getUserProfile } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"

interface Expense {
  id: string
  amount: number
  description: string | null
  date: string
  receipt_url: string | null
  categories: {
    name: string
    classification: string
  }
  profiles: {
    name: string
  }
}

interface Category {
  id: string
  name: string
  classification: string
}

export default function ExpensesPage() {
  const { user, loading } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
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
  }, [profile, selectedMonth, selectedCategory, searchTerm])

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
    if (!profile?.family_id) return

    try {
      let query = supabase
        .from("expenses")
        .select(`
          *,
          categories (name, classification),
          profiles (name)
        `)
        .eq("family_id", profile.family_id)
        .order("date", { ascending: false })

      // Filter by month
      if (selectedMonth !== "all") {
        const [year, month] = selectedMonth.split("-")
        const startDate = new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1)
        const endDate = new Date(Number.parseInt(year), Number.parseInt(month), 0)

        query = query
          .gte("date", startDate.toISOString().split("T")[0])
          .lte("date", endDate.toISOString().split("T")[0])
      }

      const { data, error } = await query

      if (error) throw error

      let filteredData = data || []

      // Filter by category
      if (selectedCategory !== "all") {
        filteredData = filteredData.filter((expense) => expense.categories.name === selectedCategory)
      }

      // Filter by search term
      if (searchTerm) {
        filteredData = filteredData.filter(
          (expense) =>
            expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expense.categories.name.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      }

      setExpenses(filteredData)
    } catch (error: any) {
      toast({
        title: "Erro ao carregar gastos",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const loadCategories = async () => {
    if (!profile?.family_id) return

    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("family_id", profile.family_id)
        .order("name")

      if (error) throw error
      setCategories(data || [])
    } catch (error: any) {
      toast({
        title: "Erro ao carregar categorias",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabase.from("expenses").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Gasto excluído com sucesso!",
      })

      loadExpenses()
    } catch (error: any) {
      toast({
        title: "Erro ao excluir gasto",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case "necessidades":
        return "bg-green-100 text-green-800"
      case "desejos":
        return "bg-amber-100 text-amber-800"
      case "poupanca":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const months = [
    { value: "all", label: "Todos os meses" },
    { value: "2024-01", label: "Janeiro 2024" },
    { value: "2024-02", label: "Fevereiro 2024" },
    { value: "2024-03", label: "Março 2024" },
    { value: "2024-04", label: "Abril 2024" },
    { value: "2024-05", label: "Maio 2024" },
    { value: "2024-06", label: "Junho 2024" },
    { value: "2024-07", label: "Julho 2024" },
    { value: "2024-08", label: "Agosto 2024" },
    { value: "2024-09", label: "Setembro 2024" },
    { value: "2024-10", label: "Outubro 2024" },
    { value: "2024-11", label: "Novembro 2024" },
    { value: "2024-12", label: "Dezembro 2024" },
  ]

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Gastos</h1>
            <p className="text-gray-600">Gerencie todos os gastos da família</p>
          </div>
          <Button onClick={() => router.push("/expenses/new")}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Gasto
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar gastos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center justify-center bg-gray-100 rounded-md px-3 py-2">
                <span className="text-sm font-medium">
                  Total: R$ {totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expenses List */}
        <div className="space-y-4">
          {expenses.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500">Nenhum gasto encontrado.</p>
                <Button className="mt-4" onClick={() => router.push("/expenses/new")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Gasto
                </Button>
              </CardContent>
            </Card>
          ) : (
            expenses.map((expense) => (
              <Card key={expense.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          R$ {expense.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </h3>
                        <Badge className={getClassificationColor(expense.categories.classification)}>
                          {expense.categories.name}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(expense.date).toLocaleDateString("pt-BR")}
                        </span>
                      </div>

                      {expense.description && <p className="text-gray-600 mb-2">{expense.description}</p>}

                      <p className="text-sm text-gray-500">Adicionado por {expense.profiles.name}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {expense.receipt_url && (
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
                            <div className="mt-4">
                              <img
                                src={expense.receipt_url || "/placeholder.svg"}
                                alt="Nota fiscal"
                                className="max-w-full h-auto rounded"
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      <Button variant="outline" size="sm" onClick={() => router.push(`/expenses/${expense.id}/edit`)}>
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm("Tem certeza que deseja excluir este gasto?")) {
                            deleteExpense(expense.id)
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
      </div>
    </div>
  )
}
