"use client";

import type React from "react";
import { useEffect, useState, useMemo } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Target,
  Calendar,
  Loader2,
  Settings,
  Folder,
  Save,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/app/auth/auth-provider";

// 1. Importar DTOs e Casos de Uso Corretos
import type {
  IncomeDetailsDTO,
  CreateIncomeDTO,
  UpdateIncomeDTO,
} from "@/domain/dto/income.types.d.ts";
import type {
  BudgetDetailsDTO,
  ExpenseSummaryByBudgetCategoryDTO,
} from "@/domain/dto/budget.types.d.ts";
import type { BudgetCategoryDetailsDTO } from "@/domain/dto/budget-category.types.d.ts";
import {
  // Receitas
  getIncomesUseCase,
  createIncomeUseCase,
  updateIncomeUseCase,
  deleteIncomeUseCase,
  // Orçamento (Snapshot)
  getBudgetUseCase,
  saveBudgetUseCase,
  // Pastas
  getBudgetCategoriesUseCase,
  createBudgetCategoryUseCase,
  updateBudgetCategoryUseCase,
  deleteBudgetCategoryUseCase,
  // Resumo de Gastos
  getExpenseSummaryByPeriodUseCase,
} from "@/infrastructure/dependency-injection";

// Tipo de estado local para a aba "Configurar Pastas"
type EditableBudgetCategory = BudgetCategoryDetailsDTO & {
  originalName: string;
  originalPercentage: number;
};

// Cores para as "pastas" (pode ser dinâmico no futuro)
const BUDGET_CATEGORY_COLORS: Record<string, string> = {
  Necessidades: "text-green-700",
  Desejos: "text-amber-700",
  Poupança: "text-blue-700",
};

export default function BudgetPage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();

  // --- Estados da UI ---
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false); // Loading de ações (salvar/deletar)
  const [isDataLoading, setIsDataLoading] = useState(true); // Loading de dados (get)

  // --- Estados da Aba de Receitas ---
  const [incomes, setIncomes] = useState<IncomeDetailsDTO[]>([]);
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeDetailsDTO | null>(
    null
  );

  // --- Estados da Aba de Orçamento ---
  const [currentBudget, setCurrentBudget] = useState<BudgetDetailsDTO | null>(
    null
  );
  const [expenseSummary, setExpenseSummary] = useState<
    ExpenseSummaryByBudgetCategoryDTO[]
  >([]);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [suggestedIncome, setSuggestedIncome] = useState(0);

  // --- Estados da Aba de Configurações ---
  const [budgetCategories, setBudgetCategories] = useState<
    EditableBudgetCategory[]
  >([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryPerc, setNewCategoryPerc] = useState("");

  const teamId = session?.teams?.[0]?.team.id;
  const userId = session?.user?.id;

  // Efeito de Autenticação
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
  }, [session, authLoading, userId, teamId, router]);

  // Efeito de Carregamento de Dados
  useEffect(() => {
    if (teamId) {
      loadAllData();
    }
  }, [teamId, selectedMonth, selectedYear]);

  const loadAllData = async () => {
    if (!teamId) return;
    setIsDataLoading(true);
    try {
      const [incomesData, budgetData, budgetCategoriesData] = await Promise.all(
        [
          getIncomesUseCase.execute(teamId),
          getBudgetUseCase.execute({
            teamId,
            month: selectedMonth,
            year: selectedYear,
          }),
          getBudgetCategoriesUseCase.execute(teamId),
        ]
      );

      setIncomes(incomesData);
      setCurrentBudget(budgetData);
      setBudgetCategories(
        budgetCategoriesData.map((bc) => ({
          ...bc,
          originalName: bc.name,
          originalPercentage: bc.percentage,
        }))
      );

      const suggested = calculateSuggestedIncome(
        incomesData,
        selectedMonth,
        selectedYear
      );
      setSuggestedIncome(suggested);

      const currentTotalIncome = budgetData?.totalIncome ?? 0;

      const expenseSummaryData = await getExpenseSummaryByPeriodUseCase.execute(
        {
          teamId,
          month: selectedMonth,
          year: selectedYear,
          totalIncome: currentTotalIncome,
        }
      );
      setExpenseSummary(expenseSummaryData);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDataLoading(false);
    }
  };

  // --- Lógica da Aba de Receitas ---
  const handleIncomeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!teamId || !userId) return;

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      amount: Number.parseFloat(formData.get("amount") as string),
      description: formData.get("description") as string,
      type: formData.get("type") as "recurring" | "one_time",
      frequency: formData.get("frequency") as
        | "monthly"
        | "weekly"
        | "yearly"
        | undefined,
      date: formData.get("date") as string,
    };

    try {
      if (editingIncome) {
        const dto: UpdateIncomeDTO = {
          ...data,
          incomeId: editingIncome.id,
          teamId: teamId,
          frequency: data.type === "recurring" ? data.frequency : undefined,
        };
        await updateIncomeUseCase.execute(dto);
        toast({ title: "Receita atualizada!" });
      } else {
        const dto: CreateIncomeDTO = {
          ...data,
          teamId: teamId,
          userId: userId,
          frequency: data.type === "recurring" ? data.frequency : undefined,
        };
        await createIncomeUseCase.execute(dto);
        toast({ title: "Receita adicionada!" });
      }
      setIsIncomeDialogOpen(false);
      setEditingIncome(null);
      await loadAllData(); // Recarrega tudo
    } catch (error: any) {
      toast({
        title: "Erro ao salvar receita",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteIncome = async (id: string) => {
    if (!teamId) return;
    try {
      await deleteIncomeUseCase.execute({ incomeId: id, teamId: teamId });
      toast({ title: "Receita excluída!" });
      await loadAllData(); // Recarrega tudo
    } catch (error: any) {
      toast({
        title: "Erro ao excluir receita",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const calculateSuggestedIncome = (
    incomesList: IncomeDetailsDTO[],
    month: number,
    year: number
  ): number => {
    return incomesList
      .filter((income) => {
        const incomeDate = new Date(income.date.replace(/-/g, "/"));
        if (income.type === "one_time") {
          return (
            incomeDate.getMonth() + 1 === month &&
            incomeDate.getFullYear() === year
          );
        }
        return income.type === "recurring" && income.frequency === "monthly";
      })
      .reduce((total, income) => total + income.amount, 0);
  };

  // --- Lógica da Aba de Orçamento (Visão Geral) ---
  const handleBudgetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!teamId) return;
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const totalIncome = Number.parseFloat(
      formData.get("totalIncome") as string
    );

    try {
      const dto = {
        teamId,
        month: selectedMonth,
        year: selectedYear,
        totalIncome,
      };
      await saveBudgetUseCase.execute(dto);
      toast({ title: "Orçamento salvo!" });
      setIsBudgetDialogOpen(false);
      await loadAllData();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar orçamento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getBudgetProgress = (spent: number, budgeted: number) => {
    if (budgeted === 0) return spent > 0 ? 100 : 0; // Se gastou sem orçamento, barra cheia
    return Math.min((spent / budgeted) * 100, 100);
  };

  // --- Lógica da Aba de Configurações ---
  const handleBudgetCategoryChange = (
    id: string,
    field: "name" | "percentage",
    value: string
  ) => {
    setBudgetCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === id) {
          if (field === "name") {
            return { ...cat, name: value };
          }
          if (field === "percentage") {
            const perc = parseFloat(value);
            return { ...cat, percentage: isNaN(perc) ? 0 : perc / 100 };
          }
        }
        return cat;
      })
    );
  };

  const handleSaveBudgetCategory = async (category: EditableBudgetCategory) => {
    if (!teamId) return;

    const total = budgetCategories.reduce((sum, c) => c.percentage, 0);
    if (total > 1.01 || total < 0.99) {
      // Permite pequena margem de arredondamento
      toast({
        title: "Total inválido",
        description: "A soma dos percentuais deve ser 100%.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await updateBudgetCategoryUseCase.execute({
        teamId,
        budgetCategoryId: category.id,
        name: category.name,
        percentage: category.percentage,
      });
      toast({
        title: "Pasta salva!",
        description: `"${category.name}" foi atualizada.`,
      });
      await loadAllData();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar pasta",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBudgetCategory = async () => {
    if (!teamId || !newCategoryName || newCategoryPerc === "") return;

    const percentage = parseFloat(newCategoryPerc) / 100;
    if (isNaN(percentage) || percentage < 0 || percentage > 1) {
      toast({
        title: "Percentual inválido",
        description: "O percentual deve ser um número entre 0 e 100.",
        variant: "destructive",
      });
      return;
    }

    const newTotal = totalPercentage + percentage;
    if (newTotal > 1.01) {
      toast({
        title: "Total excede 100%",
        description:
          "Ajuste os outros percentuais antes de adicionar uma nova pasta.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await createBudgetCategoryUseCase.execute({
        teamId,
        name: newCategoryName,
        percentage: percentage,
      });
      toast({
        title: "Pasta criada!",
        description: `"${newCategoryName}" foi adicionada.`,
      });
      setNewCategoryName("");
      setNewCategoryPerc("");
      await loadAllData();
    } catch (error: any) {
      toast({
        title: "Erro ao criar pasta",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBudgetCategory = async (
    category: BudgetCategoryDetailsDTO
  ) => {
    if (!teamId) return;
    if (
      !confirm(
        `Tem certeza que deseja excluir a pasta "${category.name}"? Categorias de gasto associadas ficarão órfãs.`
      )
    )
      return;

    setIsLoading(true);
    try {
      await deleteBudgetCategoryUseCase.execute(category.id, teamId);
      toast({ title: "Pasta excluída!" });
      await loadAllData();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir pasta",
        description:
          "Verifique se não há categorias de gasto associadas a ela.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Memos e Cálculos ---
  const totalPercentage = useMemo(() => {
    return budgetCategories.reduce((sum, c) => sum + c.percentage, 0);
  }, [budgetCategories]);

  const months = useMemo(
    () => [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ],
    []
  );

  const monthlyIncomeFromBudget = currentBudget?.totalIncome ?? 0;
  const totalSpent = expenseSummary.reduce((sum, cat) => sum + cat.spent, 0);
  const balance = monthlyIncomeFromBudget - totalSpent;

  // --- Renderização ---
  if (authLoading || !session || !teamId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-gray-900 mx-auto" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Orçamento</h1>
            <p className="text-gray-600">
              Gerencie suas receitas, plano e "pastas" de orçamento.
            </p>
          </div>
          <div className="flex gap-2">
            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) =>
                setSelectedMonth(Number.parseInt(value))
              }
              disabled={isDataLoading}
            >
              <SelectTrigger className="w-32" loading={isDataLoading}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={index} value={(index + 1).toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
              disabled={isDataLoading}
            >
              <SelectTrigger className="w-24" loading={isDataLoading}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2023, 2024, 2025].map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="budget" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="budget">Visão Geral</TabsTrigger>
            <TabsTrigger value="income">Receitas</TabsTrigger>
            <TabsTrigger value="settings">Configurar Pastas</TabsTrigger>
          </TabsList>

          {isDataLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
            </div>
          ) : (
            <>
              {/* --- ABA DE ORÇAMENTO (VISÃO GERAL) --- */}
              <TabsContent value="budget" className="space-y-6">
                {/* Cards de Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Receita Planejada
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        R${" "}
                        {monthlyIncomeFromBudget.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Gasto Real
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        R${" "}
                        {totalSpent.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Saldo (Receita - Gasto)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className={`text-2xl font-bold ${
                          balance >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        R${" "}
                        {balance.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Botão de Definir Orçamento */}
                <div className="flex justify-center">
                  <Dialog
                    open={isBudgetDialogOpen}
                    onOpenChange={setIsBudgetDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button size="lg" variant="outline">
                        <Target className="w-4 h-4 mr-2" />
                        {currentBudget
                          ? "Atualizar Renda do Mês"
                          : "Definir Renda do Mês"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Definir Renda do Orçamento</DialogTitle>
                        <DialogDescription>
                          Para {months[selectedMonth - 1]} de {selectedYear}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleBudgetSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="totalIncome">
                            Receita Total Planejada (R$)
                          </Label>
                          <Input
                            id="totalIncome"
                            name="totalIncome"
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={
                              currentBudget?.totalIncome ?? suggestedIncome
                            }
                            required
                          />
                          <p className="text-xs text-gray-500">
                            Este é o valor "snapshot" que será usado como base
                            (100%) para calcular seu plano de gastos.
                          </p>
                        </div>
                        <div className="flex gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsBudgetDialogOpen(false)}
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1"
                          >
                            {isLoading ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              "Salvar Renda"
                            )}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Cards Dinâmicos */}
                {currentBudget ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {expenseSummary.map((summary) => (
                      <Card key={summary.id}>
                        <CardHeader>
                          <CardTitle
                            className={`text-lg ${
                              BUDGET_CATEGORY_COLORS[summary.name] ||
                              "text-gray-900"
                            }`}
                          >
                            {summary.name} (
                            {(summary.percentage * 100).toFixed(0)}%)
                          </CardTitle>
                          <CardDescription>
                            Planejado: R${" "}
                            {summary.budgeted.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between text-sm font-medium">
                            <span>Gasto Real:</span>
                            <span>
                              R${" "}
                              {summary.spent.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <Progress
                            value={getBudgetProgress(
                              summary.spent,
                              summary.budgeted
                            )}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="text-center p-6">
                    <p className="text-gray-600">
                      Você ainda não definiu uma renda para este mês.
                    </p>
                    <p className="text-gray-500 text-sm">
                      Clique em "Definir Renda do Mês" para criar seu plano.
                    </p>
                  </Card>
                )}
              </TabsContent>

              {/* --- ABA DE RECEITAS --- */}
              <TabsContent value="income" className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Receitas</h2>
                    <p className="text-gray-600">
                      Gerencie suas fontes de renda (Salário, Freelance, etc.)
                    </p>
                  </div>
                  <Dialog
                    open={isIncomeDialogOpen}
                    onOpenChange={setIsIncomeDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button onClick={() => setEditingIncome(null)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Receita
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingIncome ? "Editar Receita" : "Nova Receita"}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleIncomeSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">Valor (R$)</Label>
                          <Input
                            id="amount"
                            name="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={editingIncome?.amount || ""}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Descrição</Label>
                          <Input
                            id="description"
                            name="description"
                            placeholder="Ex: Salário, Freelance..."
                            defaultValue={editingIncome?.description || ""}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="type">Tipo</Label>
                          <Select
                            name="type"
                            defaultValue={editingIncome?.type || "recurring"}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="recurring">
                                Recorrente
                              </SelectItem>
                              <SelectItem value="one_time">
                                Única vez
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="frequency">
                            Frequência (se recorrente)
                          </Label>
                          <Select
                            name="frequency"
                            defaultValue={editingIncome?.frequency || "monthly"}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Mensal</SelectItem>
                              <SelectItem value="weekly">Semanal</SelectItem>
                              <SelectItem value="yearly">Anual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="date">
                            Data (para receitas 'Única vez')
                          </Label>
                          <Input
                            id="date"
                            name="date"
                            type="date"
                            defaultValue={
                              editingIncome?.date ||
                              new Date().toISOString().split("T")[0]
                            }
                            required
                          />
                        </div>
                        <div className="flex gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsIncomeDialogOpen(false);
                              setEditingIncome(null);
                            }}
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1"
                          >
                            {isLoading ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              "Salvar"
                            )}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                {/* Lista de Receitas */}
                <div className="space-y-4">
                  {incomes.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <p className="text-gray-500">
                          Nenhuma receita encontrada.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    incomes.map((income) => (
                      <Card key={income.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg">
                                  R${" "}
                                  {income.amount.toLocaleString("pt-BR", {
                                    minimumFractionDigits: 2,
                                  })}
                                </h3>
                                <Badge
                                  variant={
                                    income.type === "recurring"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {income.type === "recurring"
                                    ? income.frequency || "Recorrente"
                                    : "Única vez"}
                                </Badge>
                              </div>
                              <p className="text-gray-900 mb-1">
                                {income.description}
                              </p>
                              <p className="text-sm text-gray-500">
                                Adicionado por {income.owner || "Desconhecido"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingIncome(income);
                                  setIsIncomeDialogOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteIncome(income.id)}
                                disabled={isLoading}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* --- ABA DE CONFIGURAÇÕES (NOVO) --- */}
              <TabsContent value="settings" className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">
                      Configurar Pastas do Orçamento
                    </h2>
                    <p className="text-gray-600">
                      Personalize os nomes e percentuais do seu plano.
                    </p>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Pastas Atuais</CardTitle>
                    <CardDescription>
                      A soma total dos percentuais deve ser 100%.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="space-y-3">
                      {budgetCategories.map((category, index) => {
                        const isChanged =
                          category.name !== category.originalName ||
                          category.percentage !== category.originalPercentage;
                        return (
                          <div
                            key={category.id}
                            className="flex items-center gap-3"
                          >
                            <Folder className="h-5 w-5 text-gray-500" />
                            <Input
                              placeholder="Nome da Pasta"
                              value={category.name}
                              onChange={(e) =>
                                handleBudgetCategoryChange(
                                  category.id,
                                  "name",
                                  e.target.value
                                )
                              }
                              className="font-medium"
                              disabled={isLoading}
                            />
                            <div className="relative w-28">
                              <Input
                                type="number"
                                value={(category.percentage * 100).toFixed(0)}
                                onChange={(e) =>
                                  handleBudgetCategoryChange(
                                    category.id,
                                    "percentage",
                                    e.target.value
                                  )
                                }
                                className="pr-7 text-right"
                                disabled={isLoading}
                                step="1"
                                min="0"
                                max="100"
                              />
                              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                %
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSaveBudgetCategory(category)}
                              disabled={!isChanged || isLoading}
                              title="Salvar Alterações"
                            >
                              <Save
                                className={`w-4 h-4 ${
                                  isChanged ? "text-blue-600" : ""
                                }`}
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleDeleteBudgetCategory(category)
                              }
                              disabled={isLoading}
                              title="Excluir Pasta"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Totalizador */}
                    <div
                      className={`mt-4 text-right font-bold text-lg ${
                        totalPercentage.toFixed(2) !== "1.00"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      Total: {(totalPercentage * 100).toFixed(0)}%
                      {totalPercentage.toFixed(2) !== "1.00" &&
                        " (A soma deve ser 100%)"}
                    </div>
                  </CardContent>
                </Card>

                {/* Criar Nova Pasta */}
                <Card>
                  <CardHeader>
                    <CardTitle>Nova Pasta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Folder className="h-5 w-5 text-gray-500" />
                      <Input
                        placeholder="Nome da Nova Pasta"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="font-medium"
                        disabled={isLoading}
                      />
                      <div className="relative w-28">
                        <Input
                          type="number"
                          placeholder="0"
                          value={newCategoryPerc}
                          onChange={(e) => setNewCategoryPerc(e.target.value)}
                          className="pr-7 text-right"
                          disabled={isLoading}
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                          %
                        </span>
                      </div>
                      <Button
                        onClick={handleCreateBudgetCategory}
                        disabled={
                          isLoading || !newCategoryName || !newCategoryPerc
                        }
                        className="w-28"
                      >
                        {isLoading ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          "Adicionar"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}
