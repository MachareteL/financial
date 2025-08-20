"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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

export default function NewExpensePage() {
  const { user, loading } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const removeFile = () => {
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
      // o caminho dentro do bucket DEVE começar pelo auth.uid()
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const amount = Number.parseFloat(formData.get("amount") as string)
    const description = formData.get("description") as string
    const date = formData.get("date") as string
    const categoryId = formData.get("category") as string

    try {
      let receiptUrl: string | null = null

      if (selectedFile) {
        receiptUrl = await uploadReceipt(selectedFile)
      }

      const { error } = await supabase.from("expenses").insert({
        amount,
        description,
        date,
        category_id: categoryId,
        family_id: profile.family_id,
        user_id: profile.id,
        receipt_url: receiptUrl,
      })

      if (error) throw error

      toast({
        title: "Gasto adicionado com sucesso!",
        description: "O gasto foi registrado na sua conta familiar.",
      })

      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar gasto",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Novo Gasto</h1>
            <p className="text-gray-600">Registre um novo gasto familiar</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Gasto</CardTitle>
            <CardDescription>Preencha os dados do gasto que deseja registrar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor (R$)</Label>
                  <Input id="amount" name="amount" type="number" step="0.01" min="0" placeholder="0,00" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input id="date" name="date" type="date" defaultValue={today} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select name="category" required>
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
                <Textarea id="description" name="description" placeholder="Descreva o gasto (opcional)" rows={3} />
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label>Nota Fiscal (opcional)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  {previewUrl ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={previewUrl || "/placeholder.svg"}
                          alt="Preview da nota fiscal"
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
                  ) : (
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
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Salvando..." : "Salvar Gasto"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
