"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Plus,
  Repeat,
  CreditCard,
  Loader2,
  Upload,
  X,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/app/auth/auth-provider";
import { toast } from "@/hooks/use-toast";

import {
  createExpenseUseCase,
  getCategoriesUseCase,
} from "@/infrastructure/dependency-injection";
import type { CategoryDetailsDTO } from "@/domain/dto/category.types.d.ts";
import type { CreateExpenseDTO } from "@/domain/dto/expense.types.d.ts";

import { parseReceiptAction } from "@/app/(app)/expenses/_actions/parse-receipt";

export default function NewExpensePage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<CategoryDetailsDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Estado para o loading da IA
  const [isParsingReceipt, setIsParsingReceipt] = useState(false);

  const [isRecurring, setIsRecurring] = useState(false);
  const [isInstallment, setIsInstallment] = useState(false);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [recurrenceType, setRecurrenceType] =
    useState<CreateExpenseDTO["recurrenceType"]>("monthly");
  const [installments, setInstallments] = useState("2");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const teamId = session?.teams?.[0]?.team.id;
  const userId = session?.user?.id;

  useEffect(() => {
    if (authLoading) return;
    if (!session || !userId) {
      router.push("/auth");
      return;
    }
    if (!teamId) {
      router.push("/onboarding");
      return;
    }

    const loadCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const data = await getCategoriesUseCase.execute(teamId);
        setCategories(data);
        if (data.length > 0 && !categoryId) {
          setCategoryId(data[0].id);
        }
      } catch (error: any) {
        toast({
          title: "Erro ao carregar categorias",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, [session, authLoading, userId, teamId, router, categoryId]);

  // --- Lógica de Upload e OCR Inteligente ---
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O limite é 10MB.",
        variant: "destructive",
      });
      return;
    }

    // 1. Define preview imediatamente
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // 2. Inicia o processamento inteligente
    setIsParsingReceipt(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Chama a Server Action
      const data = await parseReceiptAction(formData);

      if (data) {
        let fieldsUpdated = 0;

        // Preenche APENAS se os campos estiverem vazios
        if (!amount && data.amount) {
          setAmount(data.amount.toString());
          fieldsUpdated++;
        }
        if (!description && data.description) {
          setDescription(data.description);
          fieldsUpdated++;
        }
        // A data sempre vem válida da IA ou null
        if (data.date) {
          // Opcional: Você pode decidir se sobrescreve a data padrão (hoje) ou não.
          // Aqui vou sobrescrever pois a data da nota é mais relevante que "hoje".
          setDate(data.date);
          fieldsUpdated++;
        }

        if (fieldsUpdated > 0) {
          toast({
            title: "Nota Fiscal lida!",
            description: "Dados preenchidos automaticamente pela IA.",
            // Pode adicionar um ícone ou cor especial aqui
          });
        }
      }
    } catch (error) {
      console.error("Erro ao ler nota:", error);
      // Falha silenciosa ou toast discreto, para não bloquear o usuário
      toast({
        title: "Não foi possível ler os dados",
        description: "Você pode preencher manualmente.",
        variant: "destructive", // ou default
      });
    } finally {
      setIsParsingReceipt(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    const fileInput = document.getElementById("receipt") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const calculateInstallmentAmount = () => {
    const total = Number.parseFloat(amount) || 0;
    const count = Number.parseInt(installments) || 1;
    if (total === 0 || count <= 0) return 0;
    return total / count;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId || !userId) return;

    setIsLoading(true);

    try {
      const dto: CreateExpenseDTO = {
        description,
        amount: Number.parseFloat(amount),
        categoryId,
        date,
        teamId,
        userId,
        receiptFile: selectedFile,
        isRecurring,
        recurrenceType: isRecurring ? recurrenceType : undefined,
        isInstallment,
        totalInstallments: isInstallment
          ? Number.parseInt(installments)
          : undefined,
      };

      await createExpenseUseCase.execute(dto);

      toast({
        title: "Gasto adicionado com sucesso!",
        description: isInstallment
          ? `Criadas ${installments} parcelas de R$ ${calculateInstallmentAmount().toFixed(
              2
            )}`
          : "Gasto registrado",
      });

      router.push("/expenses");
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar gasto",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoadingCategories || !session || !teamId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Carregando...</h1>
          <Loader2 className="animate-spin h-8 w-8 text-gray-900 mx-auto" />
        </div>
      </div>
    );
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
            <p className="text-gray-600">
              Adicionar ao time "{session.teams[0].team.name}"
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Informações do Gasto
            </CardTitle>
            <CardDescription>
              Preencha os dados ou faça upload da nota fiscal para preenchimento
              automático.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Nota Fiscal (opcional)</Label>
                  {isParsingReceipt && (
                    <span className="text-xs text-blue-600 flex items-center gap-1 animate-pulse">
                      <Sparkles className="w-3 h-3" /> Lendo dados com IA...
                    </span>
                  )}
                </div>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                    isParsingReceipt
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-300"
                  }`}
                >
                  {previewUrl ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt="Preview da nota fiscal"
                          className="max-w-full h-48 object-contain mx-auto rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                          onClick={removeFile}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 text-center truncate">
                        {selectedFile?.name}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload
                        className={`mx-auto h-12 w-12 ${
                          isParsingReceipt ? "text-blue-400" : "text-gray-400"
                        }`}
                      />
                      <div className="mt-4">
                        <label
                          htmlFor="receipt"
                          className="cursor-pointer font-medium text-blue-600 hover:text-blue-500"
                        >
                          Clique para fazer upload
                          <input
                            id="receipt"
                            name="receipt"
                            type="file"
                            className="sr-only"
                            accept="image/png, image/jpeg, application/pdf"
                            onChange={handleFileSelect}
                            disabled={isParsingReceipt}
                          />
                        </label>
                        <p className="mt-1 block text-sm text-gray-500">
                          PNG, JPG, PDF (Max 10MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <div className="relative">
                    <Input
                      id="description"
                      placeholder="Ex: Supermercado, Gasolina..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={isParsingReceipt ? "opacity-50" : ""}
                      required
                    />
                    {isParsingReceipt && (
                      <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Valor (R$)</Label>
                    <div className="relative">
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0,00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className={isParsingReceipt ? "opacity-50" : ""}
                        required
                      />
                      {isParsingReceipt && (
                        <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="date">Data</Label>
                    <div className="relative">
                      <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className={isParsingReceipt ? "opacity-50" : ""}
                        required
                      />
                      {isParsingReceipt && (
                        <Loader2 className="absolute right-8 top-3 h-4 w-4 animate-spin text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Categoria */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select
                      value={categoryId}
                      onValueChange={setCategoryId}
                      required
                    >
                      <SelectTrigger loading={isLoadingCategories}>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name} (
                            {category.budgetCategoryName || "Sem Pasta"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Parcelamento */}
                {!isInstallment ? (
                  <div className="hidden" />
                ) : (
                  <div className="space-y-4 rounded-lg border p-4 bg-gray-50">
                    <h4 className="font-medium text-sm text-gray-900">
                      Detalhes do Parcelamento
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="totalAmount">Valor Total</Label>
                        <Input
                          value={amount}
                          disabled
                          className="bg-gray-100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="installments">Parcelas</Label>
                        <Select
                          value={installments}
                          onValueChange={setInstallments}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 23 }, (_, i) => i + 2).map(
                              (num) => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num}x
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {amount && installments && (
                      <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        <span>
                          Serão criadas <strong>{installments} despesas</strong>{" "}
                          de{" "}
                          <strong>
                            R$ {calculateInstallmentAmount().toFixed(2)}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Opções Avançadas */}
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="recurring"
                    checked={isRecurring}
                    onCheckedChange={(checked) => {
                      setIsRecurring(checked as boolean);
                      if (checked) setIsInstallment(false);
                    }}
                  />
                  <div className="space-y-2 flex-1">
                    <Label
                      htmlFor="recurring"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Repeat className="h-4 w-4 text-green-600" />
                      Gasto Recorrente
                    </Label>
                    <p className="text-sm text-gray-600">
                      Para assinaturas, aluguel, etc.
                    </p>
                    {isRecurring && (
                      <Select
                        value={recurrenceType}
                        onValueChange={(value) =>
                          setRecurrenceType(value as any)
                        }
                      >
                        <SelectTrigger className="w-48 mt-2">
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
                      setIsInstallment(checked as boolean);
                      if (checked) setIsRecurring(false);
                    }}
                  />
                  <div className="space-y-2 flex-1">
                    <Label
                      htmlFor="installment"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <CreditCard className="h-4 w-4 text-blue-600" />
                      Gasto Parcelado
                    </Label>
                    <p className="text-sm text-gray-600">
                      Para compras no cartão de crédito.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isLoading || isLoadingCategories || isParsingReceipt
                  }
                  className="flex-1"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : "Salvar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
