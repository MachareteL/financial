"use client";

import type React from "react";
import { useEffect, useState } from "react";
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
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/app/auth/auth-provider";

// 1. Importar os DTOs e Casos de Uso Corretos
import type {
  IncomeDetailsDTO,
  CreateIncomeDTO,
  UpdateIncomeDTO,
} from "@/domain/dto/income.types.d.ts";
import type {
  BudgetDetailsDTO,
  ExpenseSummaryDTO,
} from "@/domain/dto/budget.types.d.ts";
import {
  getIncomesUseCase,
  createIncomeUseCase,
  updateIncomeUseCase,
  deleteIncomeUseCase,
  getBudgetUseCase,
  saveBudgetUseCase,
  getExpenseSummaryByPeriodUseCase,
} from "@/infrastructure/dependency-injection";

export default function BudgetPage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const [incomes, setIncomes] = useState<IncomeDetailsDTO[]>([]);
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeDetailsDTO | null>(
    null
  );

  const [currentBudget, setCurrentBudget] = useState<BudgetDetailsDTO | null>(
    null
  );
  const [monthlyExpenses, setMonthlyExpenses] = useState<ExpenseSummaryDTO>({
    necessidades: 0,
    desejos: 0,
    poupanca: 0,
    total: 0,
  });
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [suggestedIncome, setSuggestedIncome] = useState(0); // Renda sugerida para o modal

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
  }, [session, authLoading, userId, teamId, router]);

  useEffect(() => {
    if (teamId) {
      loadAllData();
    }
  }, [teamId, selectedMonth, selectedYear]);

  const loadAllData = async () => {
    if (!teamId) return;
    setIsDataLoading(true);
    try {
      await Promise.all([
        loadIncomes(teamId),
        loadBudget(teamId),
        loadMonthlyExpenses(teamId),
      ]);
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

  const loadIncomes = async (teamId: string) => {
    try {
      const incomesData = await getIncomesUseCase.execute(teamId);
      setIncomes(incomesData);

      const suggested = calculateSuggestedIncome(
        incomesData,
        selectedMonth,
        selectedYear
      );
      setSuggestedIncome(suggested);
    } catch (error: any) {
      console.error("[Budget] Error loading incomes:", error);
      toast({
        title: "Erro ao carregar receitas",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadBudget = async (teamId: string) => {
    try {
      const budgetData = await getBudgetUseCase.execute({
        teamId,
        month: selectedMonth,
        year: selectedYear,
      });
      setCurrentBudget(budgetData);
    } catch (error: any) {
      console.error("[Budget] Error loading budget:", error);
      toast({
        title: "Erro ao carregar orçamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadMonthlyExpenses = async (teamId: string) => {
    try {
      const expenses = await getExpenseSummaryByPeriodUseCase.execute({
        teamId,
        month: selectedMonth,
        year: selectedYear,
      });
      setMonthlyExpenses(expenses);
    } catch (error: any) {
      console.error("[Budget] Error loading expenses:", error);
      toast({
        title: "Erro ao carregar gastos do mês",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
        toast({ title: "Receita atualizada com sucesso!" });
      } else {
        const dto: CreateIncomeDTO = {
          ...data,
          teamId: teamId,
          userId: userId,
          frequency: data.type === "recurring" ? data.frequency : undefined,
        };
        await createIncomeUseCase.execute(dto);
        toast({ title: "Receita adicionada com sucesso!" });
      }

      setIsIncomeDialogOpen(false);
      setEditingIncome(null);
      await loadIncomes(teamId);
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
      toast({ title: "Receita excluída com sucesso!" });
      await loadIncomes(teamId);
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
        totalIncome: totalIncome,
      };
      await saveBudgetUseCase.execute(dto);

      toast({ title: "Orçamento salvo com sucesso!" });
      setIsBudgetDialogOpen(false);
      await loadBudget(teamId);
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

  const getBudgetProgress = (
    category: keyof ExpenseSummaryDTO,
    budgetAmount: number
  ) => {
    if (budgetAmount === 0) return 0;
    return Math.min((monthlyExpenses[category] / budgetAmount) * 100, 100);
  };

  const getBudgetStatus = (spent: number, budget: number) => {
    if (budget === 0) return "neutral";
    const percentage = (spent / budget) * 100;
    if (percentage <= 80) return "good";
    if (percentage <= 100) return "warning";
    return "danger";
  };

  const months = [
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
  ];

  const monthlyIncomeFromBudget = currentBudget?.totalIncome ?? 0;
  const totalBudget =
    (currentBudget?.necessidadesBudget ?? 0) +
    (currentBudget?.desejosBudget ?? 0) +
    (currentBudget?.poupancaBudget ?? 0);
  const totalSpent = monthlyExpenses.total;
  const balance = monthlyIncomeFromBudget - totalSpent;

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
              Gerencie suas receitas e orçamento mensal
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="budget">Orçamento</TabsTrigger>
            <TabsTrigger value="income">Receitas</TabsTrigger>
          </TabsList>

          {isDataLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
            </div>
          ) : (
            <>
              <TabsContent value="budget" className="space-y-6">
                {/* Cards de Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Receita Mensal
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* 9. Exibe a renda do *orçamento salvo* */}
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
                        Orçamento Total
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        R${" "}
                        {totalBudget.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Gasto Total
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
                        Saldo
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

                {/* Cards 50/30/20 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card Necessidades */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-green-700">
                        Necessidades (50%)
                      </CardTitle>
                      <CardDescription>
                        Moradia, alimentação, etc.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Gasto Real:</span>
                        <span>
                          R${" "}
                          {monthlyExpenses.necessidades.toLocaleString(
                            "pt-BR",
                            { minimumFractionDigits: 2 }
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Orçamento:</span>
                        <span>
                          R${" "}
                          {(
                            currentBudget?.necessidadesBudget ?? 0
                          ).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <Progress
                        value={getBudgetProgress(
                          "necessidades",
                          currentBudget?.necessidadesBudget ?? 0
                        )}
                      />
                    </CardContent>
                  </Card>
                  {/* Card Desejos */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-amber-700">
                        Desejos (30%)
                      </CardTitle>
                      <CardDescription>Lazer, compras, etc.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Gasto Real:</span>
                        <span>
                          R${" "}
                          {monthlyExpenses.desejos.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Orçamento:</span>
                        <span>
                          R${" "}
                          {(currentBudget?.desejosBudget ?? 0).toLocaleString(
                            "pt-BR",
                            { minimumFractionDigits: 2 }
                          )}
                        </span>
                      </div>
                      <Progress
                        value={getBudgetProgress(
                          "desejos",
                          currentBudget?.desejosBudget ?? 0
                        )}
                      />
                    </CardContent>
                  </Card>
                  {/* Card Poupança */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-700">
                        Poupança (20%)
                      </CardTitle>
                      <CardDescription>
                        Investimentos, dívidas, etc.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Gasto Real:</span>
                        <span>
                          R${" "}
                          {monthlyExpenses.poupanca.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Orçamento:</span>
                        <span>
                          R${" "}
                          {(currentBudget?.poupancaBudget ?? 0).toLocaleString(
                            "pt-BR",
                            { minimumFractionDigits: 2 }
                          )}
                        </span>
                      </div>
                      <Progress
                        value={getBudgetProgress(
                          "poupanca",
                          currentBudget?.poupancaBudget ?? 0
                        )}
                      />
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
                      <Button size="lg">
                        <Target className="w-4 h-4 mr-2" />
                        {currentBudget
                          ? "Atualizar Orçamento"
                          : "Definir Orçamento"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Definir Orçamento</DialogTitle>
                        <DialogDescription>
                          Para {months[selectedMonth - 1]} de {selectedYear}
                        </DialogDescription>
                      </DialogHeader>
                      {/* 10. Formulário de Orçamento */}
                      <form onSubmit={handleBudgetSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="totalIncome">
                            Receita Total do Mês (R$)
                          </Label>
                          <Input
                            id="totalIncome"
                            name="totalIncome"
                            type="number"
                            step="0.01"
                            min="0"
                            // 11. Sugere a renda, mas usa o valor salvo se existir
                            defaultValue={
                              currentBudget?.totalIncome ?? suggestedIncome
                            }
                            required
                          />
                          <p className="text-xs text-gray-500">
                            Este valor será a base (100%) para o cálculo
                            50/30/20 e será salvo para este mês.
                          </p>
                        </div>

                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <h4 className="font-medium text-gray-900">Distribuição Automática (50/30/20)</h4>
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Necessidades (50%)</span>
                          <span className="font-medium text-green-700">
                            R$ {(currentBudget?.totalIncome * 0.5).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Desejos (30%)</span>
                          <span className="font-medium text-amber-700">
                            R$ {(currentBudget?.totalIncome * 0.3).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Poupança (20%)</span>
                          <span className="font-medium text-blue-700">
                            R$ {(currentBudget?.totalIncome * 0.2).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {currentBudget?.totalIncome === 0 && (
                      <div className="bg-amber-50 p-4 rounded-lg">
                        <p className="text-amber-800 text-sm">
                          ⚠️ Você precisa adicionar receitas antes de definir o orçamento. Vá para a aba "Receitas" e
                          adicione suas fontes de renda.
                        </p>
                      </div>
                    )}

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
                              "Salvar Orçamento"
                            )}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </TabsContent>

              {/* --- ABA DE RECEITAS --- */}
              <TabsContent value="income" className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Receitas</h2>
                    <p className="text-gray-600">
                      Gerencie suas fontes de renda
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
                    {/* 12. Modal de Receita (refatorado) */}
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingIncome ? "Editar Receita" : "Nova Receita"}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleIncomeSubmit} className="space-y-4">
                        {/* ... (Campos: Amount, Description, Type, Frequency, Date) ... */}
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
                                    ? "Recorrente"
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
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}
