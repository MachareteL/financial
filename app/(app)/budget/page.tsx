"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useTeam } from "@/app/(app)/team/team-provider";
import { usePermission } from "@/hooks/use-permission";
import {
  useBudget,
  useBudgetCategories,
  useSaveBudget,
  useUpdateBudgetCategory,
} from "@/hooks/use-budget";
import {
  useIncomes,
  useCreateIncome,
  useUpdateIncome,
  useDeleteIncome,
} from "@/hooks/use-incomes";
import { useCategories } from "@/hooks/use-categories";
import { notify } from "@/lib/notify-helper";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Save,
  TrendingUp,
  CalendarDays,
  Wallet,
  PieChart,
  Target,
  Edit2,
  Trash2,
  DollarSign,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoadingState } from "@/components/lemon/loading-state";

// Types
import type { IncomeDetailsDTO } from "@/domain/dto/income.types.d.ts";
import { DateUtils } from "@/domain/utils/date.utils";

// Configuração Visual das Pastas
const FOLDER_CONFIG: Record<
  string,
  { color: string; bg: string; border: string; iconColor: string }
> = {
  Necessidades: {
    color: "text-folder-necessities",
    bg: "bg-folder-necessities/10",
    border: "border-folder-necessities/20",
    iconColor: "bg-folder-necessities/20 text-folder-necessities",
  },
  Desejos: {
    color: "text-folder-desires",
    bg: "bg-folder-desires/10",
    border: "border-folder-desires/20",
    iconColor: "bg-folder-desires/20 text-folder-desires",
  },
  Poupança: {
    color: "text-folder-savings",
    bg: "bg-folder-savings/10",
    border: "border-folder-savings/20",
    iconColor: "bg-folder-savings/20 text-folder-savings",
  },
  Default: {
    color: "text-folder-generic",
    bg: "bg-folder-generic/10",
    border: "border-folder-generic/20",
    iconColor: "bg-folder-generic/20 text-folder-generic",
  },
};

const getFolderStyle = (name: string) => {
  const normalizedName = name.toLowerCase();
  const key =
    Object.keys(FOLDER_CONFIG).find((k) =>
      normalizedName.includes(k.toLowerCase())
    ) || "Default";
  return FOLDER_CONFIG[key];
};

export default function BudgetPage() {
  const { session, loading: authLoading } = useAuth();
  const { currentTeam } = useTeam();
  const { can } = usePermission();
  const router = useRouter();

  // --- Estado Global ---
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // --- Estado de Edição ---
  const [plannedIncome, setPlannedIncome] = useState<string>("");
  const [editedPercentages, setEditedPercentages] = useState<
    Record<string, string>
  >({}); // Mudamos para string para permitir digitação fluida

  // --- Modais ---
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeDetailsDTO | null>(
    null
  );
  const [incomeToDelete, setIncomeToDelete] = useState<string | null>(null);

  const teamId = currentTeam?.team.id;
  const userId = session?.user.id;

  // 1. Autenticação
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

  // --- React Query Hooks ---

  // Fetch Data
  const { data: incomes = [] } = useIncomes(teamId);

  const { data: budgetData } = useBudget(teamId, selectedMonth, selectedYear);

  const { data: budgetCategories = [] } = useBudgetCategories(teamId);

  const { data: categories = [] } = useCategories(teamId);

  // Mutations
  const saveBudgetMutation = useSaveBudget();
  const updateBudgetCategoryMutation = useUpdateBudgetCategory();
  const createIncomeMutation = useCreateIncome();
  const updateIncomeMutation = useUpdateIncome();
  const deleteIncomeMutation = useDeleteIncome();

  const isSaving =
    saveBudgetMutation.isPending ||
    updateBudgetCategoryMutation.isPending ||
    createIncomeMutation.isPending ||
    updateIncomeMutation.isPending ||
    deleteIncomeMutation.isPending;

  // Initialize edit states when data loads
  useEffect(() => {
    if (budgetData) {
      setPlannedIncome(budgetData.totalIncome.toString());
    }
  }, [budgetData]);

  useEffect(() => {
    if (budgetCategories.length > 0) {
      const initialPercentages: Record<string, string> = {};
      budgetCategories.forEach((bc) => {
        initialPercentages[bc.id] = (bc.percentage * 100).toString();
      });
      setEditedPercentages(initialPercentages);
    }
  }, [budgetCategories]);

  // --- Cálculos Auxiliares ---

  const numericIncome = parseFloat(plannedIncome) || 0;

  const suggestedIncome = useMemo(() => {
    return incomes
      .filter((inc) => {
        const d = DateUtils.parse(inc.date);
        if (!d) return false;

        if (inc.type === "recurring" && inc.frequency === "monthly")
          return true;

        // Use UTC methods to match the stored date which is UTC-based ISO
        // But since selectedMonth/Year are local numbers (1-12, YYYY), we need to be careful.
        // incomes are dates.
        // If income date is "2023-12-01", d is UTC midnight.
        // d.getMonth() is 11 (Dec).
        return (
          d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear
        );
      })
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [incomes, selectedMonth, selectedYear]);

  const totalPercentage = useMemo(() => {
    return Object.values(editedPercentages).reduce(
      (acc, curr) => acc + (parseFloat(curr) || 0),
      0
    );
  }, [editedPercentages]);

  const isValidTotal = Math.abs(totalPercentage - 100) < 0.1;

  // --- Chart Data ---
  const chartData = useMemo(() => {
    return budgetCategories
      .map((bc) => {
        const style = getFolderStyle(bc.name);
        return {
          name: bc.name,
          value: parseFloat(editedPercentages[bc.id] || "0"),
          color: `hsl(var(--${style.color.replace("text-", "")}))`, // Extract variable name
          fill: style.color.includes("necessities")
            ? "hsl(var(--folder-necessities))"
            : style.color.includes("desires")
              ? "hsl(var(--folder-desires))"
              : style.color.includes("savings")
                ? "hsl(var(--folder-savings))"
                : "hsl(var(--folder-generic))",
        };
      })
      .filter((d) => d.value > 0);
  }, [budgetCategories, editedPercentages]);

  // --- Handlers ---

  const handlePercentageChange = (id: string, value: string) => {
    // Validação básica ao digitar
    let val = value;
    const num = parseFloat(val);
    if (num > 100) val = "100";
    if (num < 0) val = "0";

    setEditedPercentages((prev) => ({ ...prev, [id]: val }));
  };

  const handleSliderChange = (id: string, value: number) => {
    setEditedPercentages((prev) => ({ ...prev, [id]: value.toString() }));
  };

  const handleSaveBudget = async () => {
    if (!teamId) return;
    if (!isValidTotal) {
      notify.error("A soma das categorias deve ser 100%.", "salvar orçamento");
      return;
    }

    try {
      await saveBudgetMutation.mutateAsync({
        teamId,
        userId: userId!,
        month: selectedMonth,
        year: selectedYear,
        totalIncome: numericIncome,
      });

      await Promise.all(
        budgetCategories.map((bc) => {
          const newPerc = parseFloat(editedPercentages[bc.id]);
          if (!isNaN(newPerc) && newPerc !== bc.percentage * 100) {
            return updateBudgetCategoryMutation.mutateAsync({
              teamId,
              userId: userId!,
              budgetCategoryId: bc.id,
              name: bc.name,
              percentage: newPerc / 100,
            });
          }
          return Promise.resolve();
        })
      );

      notify.success("Planejamento salvo!");
    } catch (error: unknown) {
      notify.error(error, "salvar planejamento");
    }
  };

  const handleUseSuggestedIncome = () => {
    setPlannedIncome(suggestedIncome.toString());
    notify.success("Valor atualizado!", {
      description: "Usando o total das suas receitas cadastradas.",
    });
  };

  // Handlers de Receitas (CRUD simples)
  const handleSaveIncome = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!teamId || !userId) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      amount: Number(formData.get("amount")),
      description: formData.get("description") as string,
      type: formData.get("type") as "recurring" | "one_time",
      frequency: formData.get("frequency") as "monthly" | "weekly" | "yearly",
      date: formData.get("date") as string,
    };

    try {
      if (editingIncome) {
        await updateIncomeMutation.mutateAsync({
          ...data,
          incomeId: editingIncome.id,
          teamId,
          userId,
        });
        notify.success("Receita atualizada!");
      } else {
        await createIncomeMutation.mutateAsync({ ...data, teamId, userId });
        notify.success("Receita criada!");
      }
      setIsIncomeDialogOpen(false);
      setEditingIncome(null);
    } catch (error: unknown) {
      notify.error(error, "salvar receita");
    }
  };

  const handleDeleteIncome = (id: string) => {
    setIncomeToDelete(id);
  };

  const confirmDeleteIncome = async () => {
    if (!teamId || !userId || !incomeToDelete) return;
    try {
      await deleteIncomeMutation.mutateAsync({
        incomeId: incomeToDelete,
        teamId,
        userId,
      });
      notify.success("Receita excluída.");
    } catch (e: unknown) {
      notify.error(e, "excluir receita");
    } finally {
      setIncomeToDelete(null);
    }
  };

  if (authLoading || !session || !teamId) {
    return <LoadingState message="Carregando orçamento..." />;
  }

  return (
    <div className="min-h-screen bg-background pb-20 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-muted"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Planejamento Financeiro
              </h1>
              <p className="text-sm text-muted-foreground">
                Defina suas metas e acompanhe sua distribuição.
              </p>
            </div>
          </div>

          {/* Date Selector Pill */}
          <div className="flex items-center bg-muted/50 p-1 rounded-full border border-border/50 shadow-sm">
            <Select
              value={selectedMonth.toString()}
              onValueChange={(v) => setSelectedMonth(Number(v))}
            >
              <SelectTrigger className="w-[140px] border-0 h-9 rounded-full focus:ring-0 bg-background shadow-sm text-sm font-medium px-4">
                <CalendarDays className="w-4 h-4 mr-2 text-primary" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                  <SelectItem key={m} value={m.toString()}>
                    {new Date(0, m - 1).toLocaleString("pt-BR", {
                      month: "long",
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="w-px h-4 bg-border mx-1" />
            <Select
              value={selectedYear.toString()}
              onValueChange={(v) => setSelectedYear(Number(v))}
            >
              <SelectTrigger className="w-[90px] border-0 h-9 rounded-full focus:ring-0 bg-transparent text-sm text-muted-foreground hover:text-foreground transition-colors px-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2023, 2024, 2025, 2026].map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN - STICKY SIDEBAR */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
            {/* Income Card */}
            <Card className="border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50" />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Wallet className="w-4 h-4" /> Renda Planejada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-xl md:text-2xl font-medium text-muted-foreground">
                    R$
                  </span>
                  <Input
                    type="number"
                    className="text-3xl md:text-4xl font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/20"
                    placeholder="0"
                    value={plannedIncome}
                    onChange={(e) => setPlannedIncome(e.target.value)}
                  />
                </div>
                {suggestedIncome > 0 && suggestedIncome !== numericIncome && (
                  <div
                    onClick={handleUseSuggestedIncome}
                    className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10 cursor-pointer hover:bg-primary/10 transition-colors group"
                  >
                    <div className="p-2 bg-background rounded-full shadow-sm">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary">
                        Sugestão Inteligente
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Usar R${" "}
                        {suggestedIncome.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Distribution Chart */}
            <Card className="border-border/50 shadow-card overflow-hidden">
              <CardHeader className="pb-0">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <PieChart className="w-4 h-4" /> Distribuição
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[200px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value: number) => [`${value}%`, ""]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "8px",
                          boxShadow: "var(--shadow-card)",
                        }}
                        itemStyle={{ color: "hsl(var(--foreground))" }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-foreground">
                      {totalPercentage.toFixed(0)}%
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      Alocado
                    </span>
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-6 space-y-3">
                  {chartData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.fill }}
                        />
                        <span className="text-muted-foreground font-medium">
                          {item.name}
                        </span>
                      </div>
                      <span className="font-bold text-foreground">
                        {item.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Save Action (Desktop Only) */}
            <div className="hidden lg:block bg-card border border-border/50 rounded-xl p-4 shadow-card sticky bottom-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isValidTotal ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      isValidTotal ? "text-emerald-600" : "text-destructive"
                    }`}
                  >
                    {isValidTotal ? "Orçamento Válido" : "Ajuste para 100%"}
                  </span>
                </div>
              </div>
              {!isValidTotal && (
                <p className="text-xs text-muted-foreground mb-4">
                  A soma das porcentagens deve completar os 100% para salvar.
                </p>
              )}
              <Button
                className="w-full font-bold shadow-button hover:shadow-lg transition-all"
                size="lg"
                onClick={handleSaveBudget}
                disabled={isSaving || !isValidTotal}
              >
                {isSaving ? (
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar Planejamento
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN - CONTENT */}
          <div className="lg:col-span-8 space-y-10">
            {/* Categories Grid */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" /> Categorias de
                  Orçamento
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/categories")}
                >
                  Gerenciar Categorias
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {budgetCategories.map((bc) => {
                  const percStr = editedPercentages[bc.id] || "0";
                  const percNum = parseFloat(percStr) || 0;
                  const amount = (numericIncome * percNum) / 100;
                  const style = getFolderStyle(bc.name);
                  const catsInFolder = categories.filter(
                    (c) => c.budgetCategoryId === bc.id
                  );

                  return (
                    <Card
                      key={bc.id}
                      className={`group border border-border/50 hover:border-border transition-all duration-300 shadow-sm hover:shadow-card-hover ${style.bg.replace(
                        "/10",
                        "/5"
                      )}`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2.5 rounded-xl ${style.iconColor} bg-opacity-15 shadow-sm`}
                            >
                              <Target className="w-5 h-5" />
                            </div>
                            <div>
                              <h4
                                className={`font-bold text-lg leading-none ${style.color}`}
                              >
                                {bc.name}
                              </h4>
                              <p className="text-muted-foreground text-xs font-medium mt-1">
                                Meta: {percNum}%
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center bg-background/50 rounded-lg border border-border/50 px-2 py-1">
                            <Input
                              type="number"
                              className="w-12 text-right font-bold h-auto p-0 border-none bg-transparent focus-visible:ring-0 text-foreground"
                              value={percStr}
                              onChange={(e) =>
                                handlePercentageChange(bc.id, e.target.value)
                              }
                            />
                            <span className="text-xs font-bold text-muted-foreground ml-1">
                              %
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 md:p-5 pt-2 space-y-4">
                        <div className="flex items-end justify-between">
                          <p className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                            {amount.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                              maximumFractionDigits: 0,
                            })}
                          </p>
                        </div>

                        <Slider
                          value={[percNum]}
                          max={100}
                          step={1}
                          onValueChange={(vals) =>
                            handleSliderChange(bc.id, vals[0])
                          }
                          disabled={!can("MANAGE_BUDGET")}
                          className="cursor-grab active:cursor-grabbing"
                        />

                        <div className="pt-3 border-t border-border/30">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">
                            Inclui
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {catsInFolder.slice(0, 3).map((c) => (
                              <span
                                key={c.id}
                                className="text-[10px] px-2 py-0.5 bg-muted/50 border border-border/30 text-muted-foreground rounded-full"
                              >
                                {c.name}
                              </span>
                            ))}
                            {catsInFolder.length > 3 && (
                              <span className="text-[10px] px-2 py-0.5 text-muted-foreground font-medium">
                                +{catsInFolder.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* Income Sources Section */}
            <section className="bg-muted/30 rounded-2xl p-6 border border-border/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" /> Fontes
                    de Renda
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Gerencie suas entradas recorrentes e extras.
                  </p>
                </div>
                {can("MANAGE_BUDGET") && (
                  <Button
                    onClick={() => {
                      setEditingIncome(null);
                      setIsIncomeDialogOpen(true);
                    }}
                    size="sm"
                    className="rounded-full"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Nova Receita
                  </Button>
                )}
              </div>

              {incomes.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-border/50 rounded-xl bg-background/50">
                  <div className="bg-muted/50 p-3 rounded-full w-fit mx-auto mb-3">
                    <Wallet className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">
                    Nenhuma receita cadastrada
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-[200px] mx-auto">
                    Adicione suas fontes de renda para começar a planejar.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingIncome(null);
                      setIsIncomeDialogOpen(true);
                    }}
                  >
                    Adicionar Receita
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {incomes.map((income) => (
                    <div
                      key={income.id}
                      className="bg-background border border-border/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-card-hover transition-all duration-300 group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg shrink-0">
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-foreground line-clamp-1 break-all">
                            {income.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <Badge
                              variant="secondary"
                              className="text-[10px] h-5"
                            >
                              {income.type === "recurring"
                                ? "Recorrente"
                                : "Única"}
                            </Badge>
                            <span>
                              {DateUtils.parse(income.date)?.toLocaleDateString(
                                "pt-BR"
                              ) || "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 pl-14 sm:pl-0">
                        <span className="font-bold text-foreground text-lg whitespace-nowrap">
                          R${" "}
                          {income.amount.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => {
                              setEditingIncome(income);
                              setIsIncomeDialogOpen(true);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteIncome(income.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Mobile Floating Save Bar */}
        <div className="lg:hidden fixed bottom-24 left-4 right-4 z-50 flex flex-col gap-2">
          {!isValidTotal && (
            <div className="mx-auto">
              <p className="text-[10px] text-muted-foreground bg-background/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-border/50 shadow-sm text-center">
                A soma das porcentagens deve completar os 100% para salvar.
              </p>
            </div>
          )}
          <div
            className={`bg-background/80 backdrop-blur-md border border-border/50 p-3 rounded-2xl shadow-lg flex items-center justify-between transition-all duration-300 ${
              isValidTotal
                ? "translate-y-0 opacity-100"
                : "translate-y-0 opacity-100"
            }`}
          >
            <div className="flex items-center gap-3 pl-2">
              <div
                className={`p-2 rounded-full ${isValidTotal ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"}`}
              >
                {isValidTotal ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-sm font-bold leading-none ${isValidTotal ? "text-emerald-600" : "text-destructive"}`}
                >
                  {isValidTotal ? "Orçamento Válido" : "Ajuste Necessário"}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {isValidTotal
                    ? "Pronto para salvar"
                    : `Total atual: ${totalPercentage.toFixed(0)}%`}
                </span>
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleSaveBudget}
              disabled={isSaving || !isValidTotal}
              className={`rounded-xl px-6 font-bold h-10 shadow-sm ${isValidTotal ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground"}`}
            >
              {isSaving ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </div>

        <AlertDialog
          open={!!incomeToDelete}
          onOpenChange={(open) => !open && setIncomeToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir receita?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente a
                receita do seu planejamento.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteIncome}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Income Dialog (Hidden) */}
        <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingIncome ? "Editar Receita" : "Adicionar Receita"}
              </DialogTitle>
              <DialogDescription>
                Informe os detalhes da entrada.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveIncome} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input
                    name="amount"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={editingIncome?.amount}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input
                    name="date"
                    type="date"
                    required
                    defaultValue={
                      editingIncome?.date ||
                      new Date().toISOString().split("T")[0]
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  name="description"
                  placeholder="Ex: Salário Mensal"
                  required
                  defaultValue={editingIncome?.description || ""}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    name="type"
                    defaultValue={editingIncome?.type || "recurring"}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recurring">Recorrente</SelectItem>
                      <SelectItem value="one_time">Única</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Frequência</Label>
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
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setIsIncomeDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Salvar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
