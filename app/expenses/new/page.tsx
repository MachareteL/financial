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
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, X, ArrowLeft, Repeat, CreditCard } from "lucide-react"
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

  // Estados para gastos recorrentes e parcelados
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrenceType, setRecurrenceType] = useState<string>("")
  const [isInstallment, setIsInstallment] = useState(false)
  const [totalInstallments, setTotalInstallments] = useState<number>(1)
  const [installmentValue, setInstallmentValue] = useState<number>(0)

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

  const createInstallments = async (parentExpenseId: string, formData: any) => {
    const installments = []
    const baseDate = new Date(formData.date)

    for (let i = 2; i <= totalInstallments; i++) {
      const installmentDate = new Date(baseDate)
      installmentDate.setMonth(installmentDate.getMonth() + (i - 1))

      installments.push({
        amount: installmentValue,
        description: `${formData.description} (${i}/${totalInstallments})`,
        date: installmentDate.toISOString().split("T")[0],
        category_id: formData.categoryId,
        family_id: profile.family_id,
        user_id: profile.id,
        receipt_url: null,
        is_installment: true,
        installment_number: i,
        total_installments: totalInstallments,
        installment_value: installmentValue,
        parent_expense_id: parentExpenseId,
      })
    }

    if (installments.length > 0) {
      const { error } = await supabase.from("expenses").insert(installments)
      if (error) throw error
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

      // Calcular o valor correto baseado no tipo de gasto
      let finalAmount = amount
      let finalDescription = description

      if (isInstallment) {
        finalAmount = installmentValue
        finalDescription = `${description} (1/${totalInstallments})`
      }

      // Criar o gasto principal
      const expenseData = {
        amount: finalAmount,
        description: finalDescription,
        date,
        category_id: categoryId,
        family_id: profile.family_id,
        user_id: profile.id,
        receipt_url: receiptUrl,
        is_recurring: isRecurring,
        recurrence_type: isRecurring ? recurrenceType : null,
        is_installment: isInstallment,
        installment_number: isInstallment ? 1 : null,
        total_installments: isInstallment ? totalInstallments : null,
        installment_value: isInstallment ? installmentValue : null,
        parent_expense_id: null,
      }

      const { data: expense, error } = await supabase.from("expenses").insert(expenseData).select().single()

      if (error) throw error

      // Se for parcelado, criar as parcelas futuras
      if (isInstallment && totalInstallments > 1) {
        await createInstallments(expense.id, {
          description,
          date,
          categoryId,
        })
      }

      toast({
        title: "Gasto adicionado com sucesso!",
        description: isInstallment
          ? `Gasto parcelado criado com ${totalInstallments} parcelas de R$ ${installmentValue.toFixed(2)}`
          : isRecurring
            ? "Gasto recorrente configurado"
            : "O gasto foi registrado na sua conta familiar.",
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

  const handleAmountChange = (value: string) => {
    const amount = Number.parseFloat(value) || 0
    if (isInstallment && totalInstallments > 0) {
      setInstallmentValue(amount / totalInstallments)
    }
  }

  const handleInstallmentsChange = (value: string) => {
    const installments = Number.parseInt(value) || 1
    setTotalInstallments(installments)

    const amountInput = document.querySelector('input[name="amount"]') as HTMLInputElement
    const totalAmount = Number.parseFloat(amountInput?.value) || 0

    if (totalAmount > 0) {
      setInstallmentValue(totalAmount / installments)
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
                  <Label htmlFor="amount">{isInstallment ? "Valor Total (R$)" : "Valor (R$)"}</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    onChange={(e) => handleAmountChange(e.target.value)}
                    required
                  />
                  {isInstallment && installmentValue > 0 && (
                    <p className="text-sm text-gray-600">Valor por parcela: R$ {installmentValue.toFixed(2)}</p>
                  )}
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

              {/* Opções de Recorrência e Parcelamento */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900">Opções Avançadas</h3>

                {/* Gasto Recorrente */}
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="recurring"
                    checked={isRecurring}
                    onCheckedChange={(checked) => {
                      setIsRecurring(checked as boolean)
                      if (checked) {
                        setIsInstallment(false)
                      }
                    }}
                  />
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <Repeat className="w-4 h-4 text-blue-600" />
                      <Label htmlFor="recurring" className="text-sm font-medium">
                        Gasto Recorrente
                      </Label>
                    </div>
                    <p className="text-sm text-gray-600">
                      Para assinaturas, mensalidades e outros gastos que se repetem
                    </p>

                    {isRecurring && (
                      <Select value={recurrenceType} onValueChange={setRecurrenceType} required>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Frequência da recorrência" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Mensal</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="yearly">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                {/* Gasto Parcelado */}
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="installment"
                    checked={isInstallment}
                    onCheckedChange={(checked) => {
                      setIsInstallment(checked as boolean)
                      if (checked) {
                        setIsRecurring(false)
                        setRecurrenceType("")
                      }
                    }}
                  />
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-green-600" />
                      <Label htmlFor="installment" className="text-sm font-medium">
                        Gasto Parcelado
                      </Label>
                    </div>
                    <p className="text-sm text-gray-600">
                      Para compras parceladas no cartão de crédito ou financiamentos
                    </p>

                    {isInstallment && (
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <Label htmlFor="installments" className="text-sm">
                            Número de Parcelas
                          </Label>
                          <Select
                            value={totalInstallments.toString()}
                            onValueChange={handleInstallmentsChange}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => i + 1).map((num) => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num}x
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {installmentValue > 0 && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>Resumo do Parcelamento:</strong>
                            </p>
                            <p className="text-sm text-blue-700">
                              {totalInstallments}x de R$ {installmentValue.toFixed(2)}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              Apenas o valor da parcela (R$ {installmentValue.toFixed(2)}) será contabilizado no
                              orçamento de cada mês
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
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
