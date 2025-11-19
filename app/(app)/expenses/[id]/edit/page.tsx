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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Repeat,
  CreditCard,
  AlertTriangle,
  Loader2,
  Trash2,
  Save,
  Upload,
  X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/app/auth/auth-provider";

import {
  getCategoriesUseCase,
  getExpenseByIdUseCase,
  updateExpenseUseCase,
  deleteExpenseUseCase,
} from "@/infrastructure/dependency-injection";
import type { CategoryDetailsDTO } from "@/domain/dto/category.types.d.ts";
import type {
  ExpenseDetailsDTO,
  UpdateExpenseDTO,
} from "@/domain/dto/expense.types.d.ts";
import { useTeam } from "@/app/(app)/team/team-provider";

export default function EditExpensePage() {
  const { session, loading: authLoading } = useAuth();
  const { currentTeam} = useTeam();
  
  const teamId = currentTeam?.team.id;
  const userId = session?.user.id;

  const router = useRouter();
  const params = useParams();
  const expenseId = params.id as string;

  // Estados
  const [categories, setCategories] = useState<CategoryDetailsDTO[]>([]);
  const [expense, setExpense] = useState<ExpenseDetailsDTO | null>(null);

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

    const loadData = async () => {
      setIsLoadingData(true);
      try {
        const [categoriesData, expenseData] = await Promise.all([
          getCategoriesUseCase.execute(teamId),
          getExpenseByIdUseCase.execute({ expenseId, teamId }),
        ]);

        setCategories(categoriesData);

        if (expenseData) {
          setExpense(expenseData);
          setDescription(expenseData.description || "");
          setAmount(expenseData.amount.toString());
          setCategoryId(expenseData.categoryId);
          setDate(expenseData.date);
          setExistingReceiptUrl(expenseData.receiptUrl || null); // Salva a URL original
        } else {
          toast({ title: "Gasto não encontrado", variant: "destructive" });
          router.push("/expenses");
        }
      } catch (error: any) {
        toast({
          title: "Erro ao carregar dados",
          description: error.message,
          variant: "destructive",
        });
        router.push("/expenses");
      } finally {
        setIsLoadingData(false);
      }
    };
    loadData();
  }, [teamId, expenseId]);

  // --- Lógica de Upload ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O limite é 10MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
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

    setIsSaving(true);

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
      };

      await updateExpenseUseCase.execute(dto);

      toast({
        title: "Gasto atualizado!",
        description: "As alterações foram salvas.",
      });
      router.push("/expenses");
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!teamId || !expense) return;
    const confirmMessage = expense.isInstallment
      ? "Este é um gasto parcelado. Deseja excluir APENAS esta parcela?"
      : "Tem certeza que deseja excluir este gasto?";

    if (!confirm(confirmMessage)) return;

    setIsDeleting(true);
    try {
      await deleteExpenseUseCase.execute({ expenseId: expense.id, teamId });
      toast({ title: "Gasto excluído!" });
      router.push("/expenses");
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (authLoading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-gray-900 mx-auto" />
      </div>
    );
  }

  if (!expense) return null;
  const isReadOnly = false;

  // Determina qual imagem mostrar (Preview do novo upload OU Imagem existente)
  const displayImageUrl = previewUrl || existingReceiptUrl;

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
            <p className="text-gray-600">Alterar detalhes do lançamento</p>
          </div>
        </div>

        {/* Badges de Tipo */}
        <div className="flex gap-2">
          {expense.isRecurring && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-blue-100 text-blue-800"
            >
              <Repeat className="h-3 w-3" />
              Recorrente ({expense.recurrenceType})
            </Badge>
          )}
          {expense.isInstallment && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-purple-100 text-purple-800"
            >
              <CreditCard className="h-3 w-3" />
              Parcela {expense.installmentNumber}/{expense.totalInstallments}
            </Badge>
          )}
        </div>

        {/* Aviso para Parcelas */}
        {expense.isInstallment && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-800">
                    Atenção: Gasto Parcelado
                  </p>
                  <p className="text-sm text-orange-700">
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
              Dados do Gasto
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
                    disabled={isSaving}
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
                      disabled={isSaving}
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
                      disabled={isSaving}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={categoryId}
                    onValueChange={setCategoryId}
                    disabled={isSaving}
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
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                  {displayImageUrl ? (
                    <div className="space-y-4">
                      <div className="relative group">
                        <img
                          src={displayImageUrl}
                          alt="Preview"
                          className="max-w-full h-48 object-contain mx-auto rounded shadow-sm bg-white"
                        />
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
                      <p className="text-sm text-gray-600 text-center truncate">
                        {selectedFile
                          ? `Novo arquivo: ${selectedFile.name}`
                          : "Recibo atual"}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label
                          htmlFor="receipt"
                          className="cursor-pointer font-medium text-blue-600 hover:text-blue-500"
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
                        <p className="mt-1 block text-sm text-gray-500">
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
                  disabled={isSaving || isDeleting}
                >
                  Cancelar
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isSaving || isDeleting}
                  className="flex-1"
                >
                  {isDeleting ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" /> Excluir
                    </>
                  )}
                </Button>

                <Button
                  type="submit"
                  disabled={isSaving || isDeleting}
                  className="flex-1"
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Salvar
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
