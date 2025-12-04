"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Repeat,
  CreditCard,
  AlertTriangle,
  Loader2,
  Save,
  Upload,
  X,
} from "lucide-react";
import { LoadingState } from "@/components/lemon/loading-state";
import Image from "next/image";
import { useAuth } from "@/components/providers/auth-provider";
import { usePermission } from "@/hooks/use-permission";

import { updateExpenseUseCase } from "@/infrastructure/dependency-injection";
import type { UpdateExpenseDTO } from "@/domain/dto/expense.types.d.ts";
import { useTeam } from "@/app/(app)/team/team-provider";
import { notify } from "@/lib/notify-helper";
import { compressImage } from "@/lib/compression";

// Hooks
import { useCategories } from "@/hooks/use-categories";
import { useExpense } from "@/hooks/use-expenses";

export default function EditExpensePage() {
  const { session, loading: authLoading } = useAuth();
  const { currentTeam } = useTeam();
  const { can } = usePermission();

  const teamId = currentTeam?.team.id;
  const userId = session?.user.id;

  const router = useRouter();
  const params = useParams();
  const expenseId = params.id as string;

  // React Query Hooks
  const { data: categories = [], isLoading: isLoadingCategories } =
    useCategories(teamId);
  const { data: expense, isLoading: isLoadingExpense } = useExpense({
    expenseId,
    teamId,
  });

  const [isLoading, setIsLoading] = useState(false);

  // Formulário
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState("");

  // Estados de Recibo
  const [existingReceiptUrl, setExistingReceiptUrl] = useState<string | null>(
    null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Inicializa o formulário quando os dados da despesa são carregados
  useEffect(() => {
    if (expense) {
      setDescription(expense.description || "");
      setAmount(expense.amount.toString());
      // Tenta pegar o ID direto ou do objeto aninhado
      setCategoryId(expense.categoryId || expense.category?.id || "");
      setDate(expense.date);
      setExistingReceiptUrl(expense.receiptUrl || null);
    }
  }, [expense]);

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
  }, [teamId, authLoading, session, userId, router]);

  // --- Lógica de Upload ---
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        notify.error(new Error("Arquivo muito grande"), "selecionar o arquivo");
        return;
      }

      // Preview imediato
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Comprime a imagem
      try {
        const compressedFile = await compressImage(file);
        setSelectedFile(compressedFile);
      } catch (error) {
        console.error("Erro na compressão:", error);
        setSelectedFile(file);
      }
    }
  };

  const removeFile = () => {
    // Se tem preview (arquivo novo), limpa o preview e o arquivo selecionado
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setSelectedFile(null);
    }
    // Se não tem preview, mas tem URL existente, significa que o usuário quer remover o recibo antigo
    else if (existingReceiptUrl) {
      setExistingReceiptUrl(null);
    }

    const fileInput = document.getElementById("receipt") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // --- Ações ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId || !expense) return;

    if (!categoryId) {
      notify.error(
        "Categoria obrigatória",
        "Por favor, selecione uma categoria para a despesa."
      );
      return;
    }

    setIsLoading(true);

    try {
      const dto: UpdateExpenseDTO = {
        expenseId: expense.id,
        teamId,
        description,
        amount: Number.parseFloat(amount),
        categoryId,
        date,
        // Lógica importante:
        // 1. Se selectedFile existe, mandamos ele (o UseCase fará o upload e substituirá a URL).
        // 2. Se não tem arquivo novo, mas tem existingReceiptUrl, mandamos a URL (mantém a atual).
        // 3. Se ambos são null, mandamos null (remove o recibo).
        receiptFile: selectedFile,
        receiptUrl: selectedFile ? undefined : existingReceiptUrl,
        userId: userId!,
      };

      await updateExpenseUseCase.execute(dto);

      notify.success("Despesa atualizada!", {
        description: "As alterações foram salvas com sucesso.",
      });
      router.push("/expenses");
    } catch (error: unknown) {
      notify.error(error, "salvar a despesa");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoadingCategories || isLoadingExpense) {
    return <LoadingState message="Carregando dados da despesa..." />;
  }

  if (!expense) {
    // Se não está carregando e não tem despesa, provavelmente deu erro ou não existe
    // Opcional: Redirecionar ou mostrar erro
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Despesa não encontrada.</p>
      </div>
    );
  }

  // Determina qual imagem mostrar (Preview do novo upload OU Imagem existente)
  const displayImageUrl = previewUrl || existingReceiptUrl;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Editar Despesa
            </h1>
            <p className="text-muted-foreground">
              Alterar detalhes do lançamento
            </p>
          </div>
        </div>

        {/* Badges de Tipo */}
        <div className="flex gap-2">
          {expense.isRecurring && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-secondary text-secondary-foreground"
            >
              <Repeat className="h-3 w-3" />
              Recorrente ({expense.recurrenceType})
            </Badge>
          )}
          {expense.isInstallment && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-warning/10 text-warning"
            >
              <CreditCard className="h-3 w-3" />
              Parcela {expense.installmentNumber}/{expense.totalInstallments}
            </Badge>
          )}
        </div>

        {/* Aviso para Parcelas */}
        {expense.isInstallment && (
          <Card className="border-warning/20 bg-warning/5">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                <div>
                  <p className="font-medium text-warning">
                    Atenção: Despesa Parcelada
                  </p>
                  <p className="text-sm text-warning/90">
                    As alterações feitas aqui afetarão{" "}
                    <strong>apenas esta parcela</strong>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Dados da Despesa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isLoading}
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
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={categoryId}
                    onValueChange={setCategoryId}
                    disabled={isLoading}
                    required
                  >
                    <SelectTrigger>
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

              {/* Seção de Recibo (Upload/Visualização) */}
              <div className="space-y-2 border-t pt-6">
                <Label>Nota Fiscal / Recibo</Label>
                <div className="border-2 border-dashed border-input rounded-lg p-6 bg-muted/10">
                  {displayImageUrl ? (
                    <div className="space-y-4">
                      <div className="relative group">
                        {displayImageUrl.startsWith("blob:") ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={displayImageUrl}
                              alt="Preview"
                              className="max-w-full h-48 object-contain mx-auto rounded shadow-sm bg-white"
                            />
                          </>
                        ) : (
                          <div className="relative w-full h-48">
                            <Image
                              src={displayImageUrl}
                              alt="Preview"
                              fill
                              className="object-contain mx-auto rounded shadow-sm bg-white"
                              sizes="(max-width: 768px) 100vw, 400px"
                            />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded flex items-start justify-end p-2">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8 rounded-full shadow-md"
                            onClick={removeFile}
                            title="Remover recibo"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground text-center truncate">
                        {selectedFile
                          ? `Novo arquivo: ${selectedFile.name}`
                          : "Recibo atual"}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <div className="mt-4">
                        <label
                          htmlFor="receipt"
                          className="cursor-pointer font-medium text-primary hover:text-primary/80"
                        >
                          Clique para fazer upload (ou substituir)
                          <input
                            id="receipt"
                            name="receipt"
                            type="file"
                            className="sr-only"
                            accept="image/png, image/jpeg, application/pdf"
                            onChange={handleFileSelect}
                          />
                        </label>
                        <p className="mt-1 block text-sm text-muted-foreground">
                          PNG, JPG, PDF (Max 10MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>

                {can("MANAGE_EXPENSES") && (
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" /> Salvar
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
