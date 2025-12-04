"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { notify } from "@/lib/notify-helper";
import { compressImage } from "@/lib/compression";

// Use Cases e Actions
import { parseReceiptAction } from "@/app/(app)/expenses/_actions/parse-receipt";
import type { CreateExpenseDTO } from "@/domain/dto/expense.types.d.ts";

// Hooks
import { useCategories } from "@/hooks/use-categories";
import { useCreateExpense } from "@/hooks/use-expenses";

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
  Receipt,
  CalendarIcon,
  CreditCard,
  Repeat,
  CheckCircle2,
  Trash2,
  UploadCloud,
  FileText,
} from "lucide-react";
import { UpgradeModal } from "@/components/subscription/upgrade-modal";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { LoadingState } from "@/components/lemon/loading-state";

export default function NewExpensePage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();

  // Referência para o input de arquivo invisível
  const fileInputRef = useRef<HTMLInputElement>(null);

  const teamId = session?.teams?.[0]?.team.id;
  const userId = session?.user?.id;

  // Hooks React Query
  const { data: categories = [], isLoading: isLoadingCategories } =
    useCategories(teamId);

  const createExpenseMutation = useCreateExpense();

  // Estados de Loading
  const [isLoading, setIsLoading] = useState(false);
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

    // Set default category if available and not set
    if (categories.length > 0 && !categoryId) {
      const defaultCat =
        categories.find((c) => c.name === "Outros") || categories[0];
      setCategoryId(defaultCat.id);
    }
  }, [session, authLoading, userId, teamId, router, categories, categoryId]);

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

    // Preview imediato com arquivo original
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    setIsParsingReceipt(true);
    try {
      // Comprime a imagem antes do envio
      const compressedFile = await compressImage(file);
      setSelectedFile(compressedFile);

      const formData = new FormData();
      formData.append("file", compressedFile);
      if (teamId) {
        formData.append("teamId", teamId);
      }

      const result = await parseReceiptAction(formData);

      if (result.success) {
        const data = result.data;
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
      } else {
        notify.error(result.error, "ler nota fiscal");
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
        "Informe uma descrição para a despesa."
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

      await createExpenseMutation.mutateAsync(dto);

      notify.success("Despesa registrada!", {
        description:
          expenseType === "installment"
            ? `Parcelamento em ${installments}x criado.`
            : "Sua despesa foi salva com sucesso.",
      });

      router.push("/expenses");
    } catch (error: unknown) {
      notify.error(error, "registrar a despesa");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoadingCategories || !session) {
    return <LoadingState message="Preparando nova despesa..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-20 animate-in fade-in duration-500">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-muted/50 rounded-full"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-dm-sans">
              Nova Despesa
            </h1>
            <p className="text-muted-foreground text-sm">
              Adicione uma despesa manual ou via comprovante.
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* --- MAGIC UPLOAD (IA) --- */}
          <div
            className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ${
              previewUrl
                ? "border-primary/20 bg-primary/5"
                : "border-border/50 hover:border-primary/50 hover:bg-card/50 bg-card/30 backdrop-blur-sm group"
            }`}
          >
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
                  <div className="bg-primary/10 p-3 rounded-full mb-3">
                    <Sparkles className="w-6 h-6 text-primary animate-spin-slow" />
                  </div>
                  <h3 className="text-sm font-semibold text-primary">
                    Lendo nota fiscal...
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Nossa IA está extraindo os dados.
                  </p>
                </div>
              ) : previewUrl ? (
                <div className="w-full flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-lg overflow-hidden border border-border/50 bg-background shadow-sm flex items-center justify-center">
                      {selectedFile?.type === "application/pdf" ? (
                        <FileText className="w-8 h-8 text-red-500" />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-foreground flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Anexado
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {selectedFile?.name}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 relative z-50"
                    onClick={removeFile}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remover
                  </Button>
                </div>
              ) : (
                <>
                  <div className="bg-muted/50 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform group-hover:bg-primary/10">
                    <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                    Toque para ler Nota Fiscal
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Use nossa IA para preencher tudo automaticamente. Suporta
                    Imagens e PDF.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* --- FORMULÁRIO --- */}
          <Card className="border border-border/50 shadow-sm bg-card/50 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardContent className="p-6 space-y-6">
              {/* Valor */}
              <div>
                <Label className="text-muted-foreground text-xs uppercase font-bold tracking-wide mb-2 block">
                  Valor Total
                </Label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-2xl pl-3">
                    R$
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    className="pl-12 h-14 text-3xl font-bold text-foreground placeholder:text-muted/50 border-border/50 focus-visible:ring-0 focus-visible:border-primary rounded-xl bg-background/50 focus:bg-background transition-colors font-inter"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isParsingReceipt || isLoading}
                  />
                </div>
              </div>

              {/* Descrição e Data */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs uppercase font-bold tracking-wide">
                    Descrição
                  </Label>
                  <Input
                    placeholder="Ex: Mercado, Uber..."
                    className="h-11 border-border/50 focus-visible:ring-primary bg-background/50 focus:bg-background"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isParsingReceipt || isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs uppercase font-bold tracking-wide">
                    Data
                  </Label>
                  <div className="relative">
                    <Input
                      type="date"
                      className="h-11 border-border/50 focus-visible:ring-primary bg-background/50 focus:bg-background"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      disabled={isParsingReceipt || isLoading}
                    />
                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase font-bold tracking-wide">
                  Categoria
                </Label>
                <Select
                  value={categoryId}
                  onValueChange={setCategoryId}
                  disabled={isParsingReceipt || isLoading}
                >
                  <SelectTrigger className="h-11 border-border/50 bg-background/50 focus:bg-background focus:ring-primary">
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
                          <span className="w-2 h-2 rounded-full bg-primary" />
                          {category.name}
                          {category.budgetCategoryName && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({category.budgetCategoryName})
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de Despesa (Abas Modernas) */}
              <div className="pt-2">
                <Label className="text-muted-foreground text-xs uppercase font-bold tracking-wide mb-3 block">
                  Detalhes do Lançamento
                </Label>
                <Tabs
                  defaultValue="single"
                  value={expenseType}
                  onValueChange={(v) =>
                    setExpenseType(v as "single" | "recurring" | "installment")
                  }
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3 h-10 p-1 bg-muted/50 rounded-lg">
                    <TabsTrigger
                      value="single"
                      className="rounded-md text-xs font-medium data-[state=active]:shadow-sm data-[state=active]:bg-background data-[state=active]:text-foreground"
                    >
                      Único
                    </TabsTrigger>
                    <TabsTrigger
                      value="recurring"
                      className="rounded-md text-xs font-medium data-[state=active]:shadow-sm data-[state=active]:bg-background data-[state=active]:text-foreground"
                    >
                      Recorrente
                    </TabsTrigger>
                    <TabsTrigger
                      value="installment"
                      className="rounded-md text-xs font-medium data-[state=active]:shadow-sm data-[state=active]:bg-background data-[state=active]:text-foreground"
                    >
                      Parcelado
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-4">
                    <TabsContent value="single" className="mt-0">
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                        <div className="p-2 bg-background rounded-full shadow-sm">
                          <Receipt className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Despesa pontual. Não se repete nos próximos meses.
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="recurring" className="mt-0 space-y-4">
                      <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-3">
                        <div className="flex items-center gap-2 text-primary text-sm font-medium">
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
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "bg-background text-muted-foreground border border-border/50 hover:border-primary/30"
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
                      <div className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/10 space-y-4">
                        <div className="flex items-center gap-2 text-purple-600 text-sm font-medium">
                          <CreditCard className="w-4 h-4" /> Parcelamento no
                          Cartão
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <Label className="text-[10px] uppercase text-muted-foreground font-bold mb-1.5 block">
                              Qtd. Parcelas
                            </Label>
                            <Select
                              value={installments}
                              onValueChange={setInstallments}
                            >
                              <SelectTrigger className="h-9 bg-background border-purple-200/50 text-sm">
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
                            <Label className="text-[10px] uppercase text-muted-foreground font-bold mb-1.5 block">
                              Valor Parcela
                            </Label>
                            <div className="h-9 px-3 bg-purple-500/10 border border-purple-500/20 rounded-md flex items-center text-sm font-bold text-purple-700">
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
                  className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98] rounded-xl"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 text-primary-foreground/70" />
                      Confirmar Despesa
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
