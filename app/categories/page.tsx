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
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getUserProfile } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"

interface Category {
  id: string
  name: string
  classification: "necessidades" | "desejos" | "poupanca"
  created_at: string
}

export default function CategoriesPage() {
  const { user, loading } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
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
      loadCategories()
    }
  }, [profile])

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const classification = formData.get("classification") as "necessidades" | "desejos" | "poupanca"

    try {
      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from("categories")
          .update({ name, classification })
          .eq("id", editingCategory.id)

        if (error) throw error

        toast({
          title: "Categoria atualizada com sucesso!",
        })
      } else {
        // Create new category
        const { error } = await supabase.from("categories").insert({
          name,
          classification,
          family_id: profile.family_id,
        })

        if (error) throw error

        toast({
          title: "Categoria criada com sucesso!",
        })
      }

      setIsDialogOpen(false)
      setEditingCategory(null)
      loadCategories()
    } catch (error: any) {
      toast({
        title: editingCategory ? "Erro ao atualizar categoria" : "Erro ao criar categoria",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Categoria excluída com sucesso!",
      })

      loadCategories()
    } catch (error: any) {
      toast({
        title: "Erro ao excluir categoria",
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

  const getClassificationLabel = (classification: string) => {
    switch (classification) {
      case "necessidades":
        return "Necessidades (50%)"
      case "desejos":
        return "Desejos (30%)"
      case "poupanca":
        return "Poupança (20%)"
      default:
        return classification
    }
  }

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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
            <p className="text-gray-600">Gerencie as categorias de gastos da sua família</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingCategory(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
                <DialogDescription>
                  {editingCategory
                    ? "Atualize os dados da categoria"
                    : "Crie uma nova categoria para organizar seus gastos"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Categoria</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ex: Supermercado, Combustível..."
                    defaultValue={editingCategory?.name || ""}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="classification">Classificação</Label>
                  <Select name="classification" defaultValue={editingCategory?.classification || ""} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma classificação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="necessidades">Necessidades (50%)</SelectItem>
                      <SelectItem value="desejos">Desejos (30%)</SelectItem>
                      <SelectItem value="poupanca">Poupança (20%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? "Salvando..." : editingCategory ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingCategory(category)
                        setIsDialogOpen(true)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm("Tem certeza que deseja excluir esta categoria?")) {
                          deleteCategory(category.id)
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Badge className={getClassificationColor(category.classification)}>
                  {getClassificationLabel(category.classification)}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {categories.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-500 mb-4">Nenhuma categoria encontrada.</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Categoria
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Sistema 50/30/20</CardTitle>
            <CardDescription>Como organizar suas categorias</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-800">Necessidades (50%)</Badge>
              <span className="text-sm text-gray-600">Moradia, alimentação, transporte, saúde</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-amber-100 text-amber-800">Desejos (30%)</Badge>
              <span className="text-sm text-gray-600">Lazer, entretenimento, compras não essenciais</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-100 text-blue-800">Poupança (20%)</Badge>
              <span className="text-sm text-gray-600">Investimentos, reserva de emergência</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
