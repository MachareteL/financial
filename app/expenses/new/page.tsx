"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Plus, Repeat, CreditCard } from "lucide-react"
import { createExpenseUseCase, getCategoriesUseCase } from "@/infrastructure/dependency-injection"
import { getUserProfile } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/app/auth/auth-provider"
import type { Category } from "@/domain/entities/expense"

export default function NewExpensePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRecurring, setIsRecurring] = useState(false)
  const [isInstallment, setIsInstallment] = useState(false)
  const [totalAmount, setTotalAmount] = useState("")
  const [installments, setInstallments] = useState("1")

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category_id: "",
    date: new Date().toISOString().split("T")[0],
    recurrence_type: "monthly",
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
    }
  }, [profile])

  const loadProfile = async () => {
    try {
      const userProfile = await getUserProfile()
      if (!userProfile?.familyId) {
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
    if (!profile?.familyId) return

    try {
      const data = await getCategoriesUseCase.execute({ familyId: profile.familyId })
      setCategories(data)
    } catch (error: any) {
      toast({
        title: "Erro ao carregar categorias",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const calculateInstallmentAmount = () => {
    if (!totalAmount || !installments) return 0
    return Number.parseFloat(totalAmount) / Number.parseInt(installments)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile?.familyId) return

    setIsLoading(true)

    try {
      let expenseAmount = Number.parseFloat(formData.amount)

      if (isInstallment && totalAmount) {
        expenseAmount = calculateInstallmentAmount()
      }

      await createExpenseUseCase.execute({
        description: formData.description,
        amount: expenseAmount,
        categoryId: formData.category_id,
        date: new Date(formData.date),
        familyId: profile.familyId,
        userId: user?.id!,
        isRecurring,
        recurrenceType: isRecurring ? (formData.recurrence_type as any) : undefined,
        isInstallment,
        installmentNumber: isInstallment ? 1 : undefined,
        totalInstallments: isInstallment ? Number.parseInt(installments) : undefined,
      })

      if (isInstallment && Number.parseInt(installments) > 1) {
        const baseDate = new Date(formData.date)

        for (let i = 2; i <= Number.parseInt(installments); i++) {
          const installmentDate = new Date(baseDate)
          installmentDate.setMonth(installmentDate.getMonth() + (i - 1))

          await createExpenseUseCase.execute({
            description: formData.description,
            amount: expenseAmount,
            categoryId: formData.category_id,
            date: installmentDate,
            familyId: profile.familyId,
            userId: user?.id!,
            isRecurring: false,
            isInstallment: true,
            installmentNumber: i,
            totalInstallments: Number.parseInt(installments),
          })
        }
      }

      toast({
        title: "Gasto adicionado com sucesso!",
        description: isInstallment
          ? `Criadas ${installments} parcelas de R$ ${expenseAmount.toFixed(2)}`
          : isRecurring
            ? "Gasto recorrente configurado"
            : "Gasto registrado",
      })

      router.push("/expenses")
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Novo Gasto</h1>
            <p className="text-gray-600">Adicione um novo gasto à sua família</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Informações do Gasto
            </CardTitle>
            <CardDescription>Preencha os dados do gasto que deseja registrar</CardDescription>
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

                {!isInstallment ? (
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
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="totalAmount">Valor Total (R$)</Label>
                      <Input
                        id="totalAmount"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="installments">Número de Parcelas</Label>
                      <Select value={installments} onValueChange={setInstallments}>
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
                    {totalAmount && installments && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Valor por parcela:</strong> R$ {calculateInstallmentAmount().toFixed(2)}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Apenas este valor será contabilizado no orçamento mensal
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900">Opções Avançadas</h3>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="recurring"
                    checked={isRecurring}
                    onCheckedChange={(checked) => {
                      setIsRecurring(checked as boolean)
                      if (checked) setIsInstallment(false)
                    }}
                  />
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="recurring" className="flex items-center gap-2 cursor-pointer">
                        <Repeat className="h-4 w-4 text-green-600" />
                        Gasto Recorrente
                      </Label>
                    </div>
                    <p className="text-sm text-gray-600">
                      Para gastos que se repetem regularmente (ex: assinaturas, mensalidades)
                    </p>
                    {isRecurring && (
                      <Select
                        value={formData.recurrence_type}
                        onValueChange={(value) => setFormData({ ...formData, recurrence_type: value })}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
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

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="installment"
                    checked={isInstallment}
                    onCheckedChange={(checked) => {
                      setIsInstallment(checked as boolean)
                      if (checked) {
                        setIsRecurring(false)
                        setFormData({ ...formData, amount: "" })
                      } else {
                        setTotalAmount("")
                        setInstallments("1")
                      }
                    }}
                  />
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="installment" className="flex items-center gap-2 cursor-pointer">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                        Gasto Parcelado
                      </Label>
                    </div>
                    <p className="text-sm text-gray-600">
                      Para compras parceladas no cartão de crédito ou financiamentos
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
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
