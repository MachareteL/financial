"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth/auth-provider";
import { notify } from "@/lib/notify-helper";

// Use Cases e Actions
import {
  createExpenseUseCase,
  getCategoriesUseCase,
} from "@/infrastructure/dependency-injection";
import { parseReceiptAction } from "@/app/(app)/expenses/_actions/parse-receipt";
import type { CategoryDetailsDTO } from "@/domain/dto/category.types.d.ts";
import type { CreateExpenseDTO } from "@/domain/dto/expense.types.d.ts";

// UI Components
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
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  ScanLine,
  Receipt,
  CalendarIcon,
  CreditCard,
  Repeat,
  CheckCircle2,
  Trash2,
  UploadCloud,
  FileText,
} from "lucide-react";
import { UpgradeModal } from "@/app/(app)/components/upgrade-modal";
import { useFeatureAccess } from "@/hooks/use-feature-access";

export default function NewExpensePage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();

  // Referência para o input de arquivo invisível
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dados
  const [categories, setCategories] = useState<CategoryDetailsDTO[]>([]);

  // Estados de Loading
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isParsingReceipt, setIsParsingReceipt] = useState(false);

  // Formulário
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Configurações Avançadas (Tabs: Único, Recorrente, Parcelado)
  const [expenseType, setExpenseType] = useState<
    "single" | "recurring" | "installment"
  >("single");

  // Detalhes específicos
  const [recurrenceType, setRecurrenceType] =
    useState<CreateExpenseDTO["recurrenceType"]>("monthly");
  const [installments, setInstallments] = useState("2");

  // Arquivo
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const teamId = session?.teams?.[0]?.team.id;
  const userId = session?.user?.id;

  // Feature Access
  const { hasAccess: hasAiAccess } = useFeatureAccess("ai_receipt_scanning");
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // --- 1. Inicialização ---
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
          // Tenta achar uma categoria "Outros" ou pega a primeira
          const defaultCat = data.find((c) => c.name === "Outros") || data[0];
          setCategoryId(defaultCat.id);
        }
      } catch (error: any) {
        notify.error(error, "carregar categorias");
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, [session, authLoading, userId, teamId, router]);

  // --- 2. Upload Inteligente (IA) ---
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!hasAiAccess) {
      setIsUpgradeModalOpen(true);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      // 8MB
      notify.error(new Error("Arquivo muito grande"), "selecionar o arquivo");
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    setIsParsingReceipt(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (teamId) {
        formData.append("teamId", teamId);
      }

      const data = await parseReceiptAction(formData);

      if (data) {
        if (data.amount) setAmount(data.amount.toString());
        if (data.description) setDescription(data.description);
        if (data.date) setDate(data.date);

        if (data.category) {
          const matchedCategory = categories.find(
            (c) =>
              c.name.toLowerCase().includes(data.category!.toLowerCase()) ||
              data.category!.toLowerCase().includes(c.name.toLowerCase())
          );
          if (matchedCategory) {
            setCategoryId(matchedCategory.id);
          }
        }

        notify.success("Nota fiscal lida!", {
          description: "Os dados foram preenchidos automaticamente.",
        });
      }
    } catch (error) {
      console.error("Erro na leitura:", error);
      notify.info(
        "Leitura automática falhou",
        "Por favor, preencha os dados manualmente."
      );
    } finally {
      setIsParsingReceipt(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- 3. Cálculos Auxiliares ---
  const calculateInstallmentValue = () => {
    const total = Number.parseFloat(amount) || 0;
    const count = Number.parseInt(installments) || 1;
    return count > 0 ? total / count : 0;
  };

  // --- 4. Submissão ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId || !userId) return;

    if (!amount || Number.parseFloat(amount) <= 0) {
      notify.error("Valor inválido", "O valor deve ser maior que zero.");
      return;
    }
    if (!description.trim()) {
      notify.error(
        "Descrição obrigatória",
        "Informe uma descrição para o gasto."
      );
      return;
    }

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
        isRecurring: expenseType === "recurring",
        recurrenceType:
          expenseType === "recurring" ? recurrenceType : undefined,
        isInstallment: expenseType === "installment",
        totalInstallments:
          expenseType === "installment"
            ? Number.parseInt(installments)
            : undefined,
      };

      await createExpenseUseCase.execute(dto);

      notify.success("Gasto registrado!", {
        description:
          expenseType === "installment"
            ? `Parcelamento em ${installments}x criado.`
            : "Sua despesa foi salva com sucesso.",
      });

      router.push("/expenses");
    } catch (error: any) {
      notify.error(error, "registrar a despesa");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoadingCategories || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-in fade-in duration-500">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-white rounded-full"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Novo Gasto</h1>
            <p className="text-slate-500 text-sm">
              Adicione uma despesa manual ou via comprovante.
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* --- MAGIC UPLOAD (IA) --- */}
          {/* Correção: Quando tem arquivo, removemos o input gigante para não bloquear o botão de remover */}
          <div
            className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ${
              previewUrl
                ? "border-blue-200 bg-blue-50/40"
                : "border-slate-200 hover:border-blue-400 hover:bg-white bg-white group"
            }`}
          >
            {/* Input cobre tudo APENAS se não tiver preview */}
            {!previewUrl && !isParsingReceipt && (
              <input
                ref={fileInputRef}
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                accept="image/png, image/jpeg, application/pdf"
                onChange={handleFileSelect}
              />
            )}

            <div className="p-6 flex flex-col items-center justify-center text-center min-h-[140px]">
              {isParsingReceipt ? (
                <div className="flex flex-col items-center animate-pulse">
                  <div className="bg-blue-100 p-3 rounded-full mb-3">
                    <Sparkles className="w-6 h-6 text-blue-600 animate-spin-slow" />
                  </div>
                  <h3 className="text-sm font-semibold text-blue-700">
                    Lendo nota fiscal...
                  </h3>
                  <p className="text-xs text-blue-500 mt-1">
                    Nossa IA está extraindo os dados.
                  </p>
                </div>
              ) : previewUrl ? (
                <div className="w-full flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm flex items-center justify-center">
                      {selectedFile?.type === "application/pdf" ? (
                        <FileText className="w-8 h-8 text-red-500" />
                      ) : (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-slate-900 flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Anexado
                      </p>
                      <p className="text-xs text-slate-500 truncate max-w-[180px]">
                        {selectedFile?.name}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 relative z-50"
                    onClick={removeFile}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remover
                  </Button>
                </div>
              ) : (
                <>
                  <div className="bg-slate-50 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform group-hover:bg-blue-50">
                    <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">
                    Toque para ler Nota Fiscal
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Use nossa IA para preencher tudo automaticamente. Suporta
                    Imagens e PDF.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* --- FORMULÁRIO --- */}
          <Card className="border-none shadow-md bg-white rounded-2xl overflow-hidden">
            <CardContent className="p-6 space-y-6">
              {/* Valor */}
              <div>
                <Label className="text-slate-500 text-xs uppercase font-bold tracking-wide mb-2 block">
                  Valor Total
                </Label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-2xl pl-3">
                    R$
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    className="pl-12 h-14 text-3xl font-bold text-slate-900 placeholder:text-slate-200 border-slate-200 focus-visible:ring-0 focus-visible:border-blue-500 rounded-xl bg-slate-50/50 focus:bg-white transition-colors"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isParsingReceipt || isLoading}
                  />
                </div>
              </div>

              {/* Descrição e Data */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-slate-500 text-xs uppercase font-bold tracking-wide">
                    Descrição
                  </Label>
                  <Input
                    placeholder="Ex: Mercado, Uber..."
                    className="h-11 border-slate-200 focus-visible:ring-blue-500 bg-slate-50/50 focus:bg-white"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isParsingReceipt || isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-500 text-xs uppercase font-bold tracking-wide">
                    Data
                  </Label>
                  <div className="relative">
                    <Input
                      type="date"
                      className="h-11 border-slate-200 focus-visible:ring-blue-500 bg-slate-50/50 focus:bg-white"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      disabled={isParsingReceipt || isLoading}
                    />
                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <Label className="text-slate-500 text-xs uppercase font-bold tracking-wide">
                  Categoria
                </Label>
                <Select
                  value={categoryId}
                  onValueChange={setCategoryId}
                  disabled={isParsingReceipt || isLoading}
                >
                  <SelectTrigger className="h-11 border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-blue-500">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          {category.name}
                          {category.budgetCategoryName && (
                            <span className="text-xs text-slate-400 ml-1">
                              ({category.budgetCategoryName})
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de Gasto (Abas Modernas) */}
              <div className="pt-2">
                <Label className="text-slate-500 text-xs uppercase font-bold tracking-wide mb-3 block">
                  Detalhes do Lançamento
                </Label>
                <Tabs
                  defaultValue="single"
                  value={expenseType}
                  onValueChange={(v) => setExpenseType(v as any)}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3 h-10 p-1 bg-slate-100 rounded-lg">
                    <TabsTrigger
                      value="single"
                      className="rounded-md text-xs font-medium data-[state=active]:shadow-sm"
                    >
                      Único
                    </TabsTrigger>
                    <TabsTrigger
                      value="recurring"
                      className="rounded-md text-xs font-medium data-[state=active]:shadow-sm"
                    >
                      Recorrente
                    </TabsTrigger>
                    <TabsTrigger
                      value="installment"
                      className="rounded-md text-xs font-medium data-[state=active]:shadow-sm"
                    >
                      Parcelado
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-4">
                    <TabsContent value="single" className="mt-0">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="p-2 bg-white rounded-full shadow-sm">
                          <Receipt className="w-4 h-4 text-slate-400" />
                        </div>
                        <p className="text-xs text-slate-500">
                          Gasto pontual. Não se repete nos próximos meses.
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="recurring" className="mt-0 space-y-4">
                      <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
                        <div className="flex items-center gap-2 text-blue-700 text-sm font-medium">
                          <Repeat className="w-4 h-4" /> Frequência da cobrança
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {(["weekly", "monthly", "yearly"] as const).map(
                            (t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setRecurrenceType(t)}
                                className={`py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                                  recurrenceType === t
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300"
                                }`}
                              >
                                {t === "weekly"
                                  ? "Semanal"
                                  : t === "monthly"
                                  ? "Mensal"
                                  : "Anual"}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="installment" className="mt-0 space-y-4">
                      <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 space-y-4">
                        <div className="flex items-center gap-2 text-purple-700 text-sm font-medium">
                          <CreditCard className="w-4 h-4" /> Parcelamento no
                          Cartão
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <Label className="text-[10px] uppercase text-slate-500 font-bold mb-1.5 block">
                              Qtd. Parcelas
                            </Label>
                            <Select
                              value={installments}
                              onValueChange={setInstallments}
                            >
                              <SelectTrigger className="h-9 bg-white border-purple-200 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from(
                                  { length: 23 },
                                  (_, i) => i + 2
                                ).map((num) => (
                                  <SelectItem
                                    key={num}
                                    value={num.toString()}
                                    className="text-sm"
                                  >
                                    {num}x
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex-1">
                            <Label className="text-[10px] uppercase text-slate-500 font-bold mb-1.5 block">
                              Valor Parcela
                            </Label>
                            <div className="h-9 px-3 bg-purple-100/50 border border-purple-200 rounded-md flex items-center text-sm font-bold text-purple-900">
                              R${" "}
                              {calculateInstallmentValue().toLocaleString(
                                "pt-BR",
                                { minimumFractionDigits: 2 }
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>

              {/* Botão Salvar */}
              <div className="pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || isParsingReceipt}
                  className="w-full h-12 text-base font-semibold shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 transition-all active:scale-[0.98]"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 text-blue-200" />
                      Confirmar Gasto
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        featureName="Leitura com IA"
      />
    </div>
  );
}
