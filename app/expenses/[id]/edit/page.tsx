"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Repeat, CreditCard, AlertTriangle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getUserProfile } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/app/auth/auth-provider"

interface Category {
  id: string
  name: string
  classification: string
}

interface Expense {
  id: string
  description: string
  amount: number
  date: string
  category_id: string
  is_recurring: boolean
  recurrence_type: string | null
  is_installment: boolean
  installment_number: number | null
  total_installments: number | null
  parent_expense_id: string | null
  categories: {
    name: string
    classification: string
  }
}

export default function EditExpensePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const expenseId = params.id as string

  const [profile, setProfile] = useState<any>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [expense, setExpense] = useState<Expense | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category_id: "",
    date: "",
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
      return
    }

    if (user) {
      loadProfile()
    }
  }, [user, loading, router])

  useEffect(() => {
    if (profile) {
      loadCategories()
      loadExpense()
    }
  }, [profile, expenseId])

  const loadProfile = async () => {
    try {
      const userProfile = await getUserProfile()
      if (!userProfile?.family_id) {
        router.push("/onboarding")
        return
      }
      setProfile(userProfile)
    } catch (error) {
      console.error("Error loading profile:", error)
      router.push("/auth")
    }
  }

  const loadCategories = async () => {
    if (!profile?.family_id) return

    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, classification")
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

  const loadExpense = async () => {
    if (!profile?.family_id) return

    try {
      const { data, error } = await supabase
        .from("expenses")
        .select(`
          *,
          categories (name, classification)
        `)
        .eq("id", expenseId)
        .eq("family_id", profile.family_id)
        .single()

      if (error) throw error

      setExpense(data)
      setFormData({
        description: data.description,
        amount: data.amount.toString(),
        category_id: data.category_id,
        date: data.date,
      })
    } catch (error: any) {
      toast({
        title: "Erro ao carregar gasto",
        description: error.message,
        variant: "destructive",
      })
      router.push("/expenses")
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile?.family_id || !expense) return

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from("expenses")
        .update({
          description: formData.description,
          amount: Number.parseFloat(formData.amount),
          category_id: formData.category_id,
          date: formData.date,
        })
        .eq("id", expenseId)
        .eq("family_id", profile.family_id)

      if (error) throw error

      toast({
        title: "Gasto atualizado com sucesso!",
        description: "As alterações foram salvas.",
      })

      router.push("/expenses")
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar gasto",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!profile?.family_id || !expense) return

    if (!confirm("Tem certeza que deseja excluir este gasto?")) return

    setIsLoading(true)

    try {
      const { error } = await supabase.from("expenses").delete().eq("id", expenseId).eq("family_id", profile.family_id)

      if (error) throw error

      toast({
        title: "Gasto excluído com sucesso!",
        description: "O gasto foi removido permanentemente.",
      })

      router.push("/expenses")
    } catch (error: any) {
      toast({
        title: "Erro ao excluir gasto",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user || !profile || !expense) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar Gasto</h1>
            <p className="text-gray-600">Modifique as informações do gasto</p>
          </div>
        </div>

        {/* Expense Type Badges */}
        <div className="flex gap-2">
          {expense.is_recurring && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Repeat className="h-3 w-3" />
              Recorrente ({expense.recurrence_type})
            </Badge>
          )}
          {expense.is_installment && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              Parcela {expense.installment_number}/{expense.total_installments}
            </Badge>
          )}
        </div>

        {/* Warning for installment expenses */}
        {expense.is_installment && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">Gasto Parcelado</p>
                  <p className="text-sm text-orange-700">
                    Este é um gasto parcelado. Alterações afetarão apenas esta parcela específica.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Informações do Gasto
            </CardTitle>
            <CardDescription>Atualize os dados do gasto conforme necessário</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    placeholder="Ex: Supermercado, Gasolina, Netflix..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Valor (R$)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name} ({category.classification})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Excluindo..." : "Excluir"}
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
