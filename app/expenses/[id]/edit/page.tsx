"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getUserProfile } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"

interface Category {
  id: string
  name: string
  classification: string
}

interface Expense {
  id: string
  amount: number
  description: string | null
  date: string
  category_id: string
  receipt_url: string | null
  categories: {
    name: string
    classification: string
  }
}

export default function EditExpensePage() {
  const { user, loading } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [expense, setExpense] = useState<Expense | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [shouldRemoveCurrentImage, setShouldRemoveCurrentImage] = useState(false)
  const router = useRouter()
  const params = useParams()
  const expenseId = params.id as string

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
      loadExpense()
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

      if (!data) {
        toast({
          title: "Gasto não encontrado",
          variant: "destructive",
        })
        router.push("/expenses")
        return
      }

      setExpense(data)
    } catch (error: any) {
      toast({
        title: "Erro ao carregar gasto",
        description: error.message,
        variant: "destructive",
      })
      router.push("/expenses")
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setShouldRemoveCurrentImage(false)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  const handleRemoveCurrentImage = () => {
    setShouldRemoveCurrentImage(true)
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  const uploadReceipt = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${profile.id}/${fileName}`

      const { error: uploadError } = await supabase.storage.from("receipts").upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("receipts").getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error("Error uploading file:", error)
      return null
    }
  }

  const deleteOldReceipt = async (receiptUrl: string) => {
    try {
      // A url pública termina em .../bucket/path
      const parts = receiptUrl.split("/")
      // pega tudo depois do nome do bucket
      const bucketIndex = parts.findIndex((p) => p === "receipts")
      const pathInsideBucket = parts.slice(bucketIndex + 1).join("/")
      await supabase.storage.from("receipts").remove([pathInsideBucket])
    } catch (error) {
      console.error("Error deleting old receipt:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const amount = Number.parseFloat(formData.get("amount") as string)
    const description = formData.get("description") as string
    const date = formData.get("date") as string
    const categoryId = formData.get("category") as string

    try {
      let receiptUrl: string | null = expense?.receipt_url || null

      // Handle receipt changes
      if (shouldRemoveCurrentImage && expense?.receipt_url) {
        // Remove current image
        await deleteOldReceipt(expense.receipt_url)
        receiptUrl = null
      } else if (selectedFile) {
        // Upload new image
        const newReceiptUrl = await uploadReceipt(selectedFile)
        if (newReceiptUrl) {
          // Delete old image if exists
          if (expense?.receipt_url) {
            await deleteOldReceipt(expense.receipt_url)
          }
          receiptUrl = newReceiptUrl
        }
      }

      const { error } = await supabase
        .from("expenses")
        .update({
          amount,
          description,
          date,
          category_id: categoryId,
          receipt_url: receiptUrl,
        })
        .eq("id", expenseId)

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

  if (loading || !profile || !expense) {
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
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Gasto</h1>
            <p className="text-gray-600">Atualize as informações do gasto</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Gasto</CardTitle>
            <CardDescription>Atualize os dados do gasto conforme necessário</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor (R$)</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    defaultValue={expense.amount}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input id="date" name="date" type="date" defaultValue={expense.date} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select name="category" defaultValue={expense.category_id} required>
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

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Descreva o gasto (opcional)"
                  rows={3}
                  defaultValue={expense.description || ""}
                />
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label>Nota Fiscal</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  {/* Current Image */}
                  {expense.receipt_url && !shouldRemoveCurrentImage && !previewUrl && (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={expense.receipt_url || "/placeholder.svg"}
                          alt="Nota fiscal atual"
                          className="max-w-full h-48 object-contain mx-auto rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={handleRemoveCurrentImage}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 text-center">Imagem atual</p>
                    </div>
                  )}

                  {/* New Image Preview */}
                  {previewUrl && (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={previewUrl || "/placeholder.svg"}
                          alt="Preview da nova nota fiscal"
                          className="max-w-full h-48 object-contain mx-auto rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeFile}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 text-center">{selectedFile?.name}</p>
                    </div>
                  )}

                  {/* Upload Area */}
                  {!previewUrl && (!expense.receipt_url || shouldRemoveCurrentImage) && (
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="receipt" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Clique para fazer upload da nota fiscal
                          </span>
                          <span className="mt-1 block text-sm text-gray-500">PNG, JPG, GIF até 10MB</span>
                        </label>
                        <input
                          id="receipt"
                          name="receipt"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleFileSelect}
                        />
                      </div>
                    </div>
                  )}

                  {/* Change Image Button */}
                  {expense.receipt_url && !shouldRemoveCurrentImage && !previewUrl && (
                    <div className="text-center mt-4">
                      <label htmlFor="receipt-change" className="cursor-pointer">
                        <Button type="button" variant="outline" size="sm" asChild>
                          <span>Alterar Imagem</span>
                        </Button>
                      </label>
                      <input
                        id="receipt-change"
                        name="receipt-change"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleFileSelect}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                  Cancelar
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
