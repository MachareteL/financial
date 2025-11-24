"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth/auth-provider";
import { useTeam } from "@/app/(app)/team/team-provider";
import {
  getIncomesUseCase,
  createIncomeUseCase,
  updateIncomeUseCase,
  deleteIncomeUseCase,
  getBudgetUseCase,
  saveBudgetUseCase,
  getBudgetCategoriesUseCase,
  createBudgetCategoryUseCase,
  updateBudgetCategoryUseCase,
  deleteBudgetCategoryUseCase,
  getCategoriesUseCase,
} from "@/infrastructure/dependency-injection";
import { notify } from "@/lib/notify-helper";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  RefreshCw,
  DollarSign,
  ArrowRight,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

// Types
import type {
  IncomeDetailsDTO,
  CreateIncomeDTO,
  UpdateIncomeDTO,
} from "@/domain/dto/income.types.d.ts";
import type { BudgetCategoryDetailsDTO } from "@/domain/dto/budget-category.types.d.ts";
import type { CategoryDetailsDTO } from "@/domain/dto/category.types.d.ts";

// Configuração Visual das Pastas
const FOLDER_CONFIG: Record<string, { color: string; bg: string; border: string; iconColor: string }> = {
  Necessidades: { color: "text-blue-700", bg: "bg-blue-50/50", border: "border-blue-200", iconColor: "bg-blue-100 text-blue-600" },
  Desejos: { color: "text-purple-700", bg: "bg-purple-50/50", border: "border-purple-200", iconColor: "bg-purple-100 text-purple-600" },
  Poupança: { color: "text-emerald-700", bg: "bg-emerald-50/50", border: "border-emerald-200", iconColor: "bg-emerald-100 text-emerald-600" },
  Default: { color: "text-slate-700", bg: "bg-slate-50/50", border: "border-slate-200", iconColor: "bg-slate-100 text-slate-600" },
};

const getFolderStyle = (name: string) => {
  const key = Object.keys(FOLDER_CONFIG).find((k) => name.includes(k)) || "Default";
  return FOLDER_CONFIG[key];
};

export default function BudgetPage() {
  const { session, loading: authLoading } = useAuth();
  const { currentTeam } = useTeam();
  const router = useRouter();

  // --- Estado Global ---
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // --- Dados ---
  const [incomes, setIncomes] = useState<IncomeDetailsDTO[]>([]);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategoryDetailsDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDetailsDTO[]>([]);
  
  // --- Estado de Edição ---
  const [plannedIncome, setPlannedIncome] = useState<string>(""); 
  const [editedPercentages, setEditedPercentages] = useState<Record<string, string>>({}); // Mudamos para string para permitir digitação fluida

  // --- Modais ---
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeDetailsDTO | null>(null);

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

  // 2. Carregar Dados
  useEffect(() => {
    if (teamId) loadData();
  }, [teamId, selectedMonth, selectedYear]);

  const loadData = async () => {
    if (!teamId) return;
    setIsLoading(true);
    try {
      const [incomesData, budgetData, budgetCatsData, catsData] = await Promise.all([
        getIncomesUseCase.execute(teamId),
        getBudgetUseCase.execute({ teamId, month: selectedMonth, year: selectedYear }),
        getBudgetCategoriesUseCase.execute(teamId),
        getCategoriesUseCase.execute(teamId),
      ]);

      setIncomes(incomesData);
      setBudgetCategories(budgetCatsData);
      setCategories(catsData);

      // Inicializa valores de edição
      setPlannedIncome(budgetData?.totalIncome.toString() || "0");
      
      const initialPercentages: Record<string, string> = {};
      budgetCatsData.forEach((bc) => {
        initialPercentages[bc.id] = (bc.percentage * 100).toString();
      });
      setEditedPercentages(initialPercentages);

    } catch (error: any) {
      notify.error(error, "carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Cálculos Auxiliares ---

  const numericIncome = parseFloat(plannedIncome) || 0;

  const suggestedIncome = useMemo(() => {
    return incomes
      .filter((inc) => {
        const d = new Date(inc.date.replace(/-/g, "/"));
        if (inc.type === "recurring" && inc.frequency === "monthly") return true;
        return (
          d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear
        );
      })
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [incomes, selectedMonth, selectedYear]);

  const totalPercentage = useMemo(() => {
    return Object.values(editedPercentages).reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);
  }, [editedPercentages]);

  const isValidTotal = Math.abs(totalPercentage - 100) < 0.1;

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
  }

  const handleSaveBudget = async () => {
    if (!teamId) return;
    if (!isValidTotal) {
      notify.error("A soma das categorias deve ser 100%.", "salvar orçamento");
      return;
    }

    setIsSaving(true);
    try {
      await saveBudgetUseCase.execute({
        teamId,
        month: selectedMonth,
        year: selectedYear,
        totalIncome: numericIncome,
      });

      await Promise.all(
        budgetCategories.map((bc) => {
          const newPerc = parseFloat(editedPercentages[bc.id]);
          if (!isNaN(newPerc) && newPerc !== bc.percentage * 100) {
            return updateBudgetCategoryUseCase.execute({
              teamId,
              budgetCategoryId: bc.id,
              name: bc.name,
              percentage: newPerc / 100,
            });
          }
          return Promise.resolve();
        })
      );

      notify.success("Planejamento salvo!");
      await loadData();
    } catch (error: any) {
      notify.error(error, "salvar planejamento");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUseSuggestedIncome = () => {
    setPlannedIncome(suggestedIncome.toString());
    notify.success("Valor atualizado!", { description: "Usando o total das suas receitas cadastradas." });
  };

  // Handlers de Receitas (CRUD simples)
  const handleSaveIncome = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!teamId || !userId) return;
    
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      amount: Number(formData.get("amount")),
      description: formData.get("description") as string,
      type: formData.get("type") as any,
      frequency: formData.get("frequency") as any,
      date: formData.get("date") as string,
    };

    try {
      if (editingIncome) {
        await updateIncomeUseCase.execute({ ...data, incomeId: editingIncome.id, teamId });
        notify.success("Receita atualizada!");
      } else {
        await createIncomeUseCase.execute({ ...data, teamId, userId });
        notify.success("Receita criada!");
      }
      setIsIncomeDialogOpen(false);
      setEditingIncome(null);
      loadData();
    } catch (error: any) {
      notify.error(error, "salvar receita");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteIncome = async (id: string) => {
    if (!teamId) return;
    if(!confirm("Excluir esta receita?")) return;
    try {
      await deleteIncomeUseCase.execute({ incomeId: id, teamId });
      notify.success("Receita excluída.");
      loadData();
    } catch (e: any) {
      notify.error(e, "excluir receita");
    }
  }

  if (authLoading || !session || !teamId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-5 w-5 text-slate-500" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Planejamento</h1>
            <p className="text-slate-500">Defina as metas para o seu dinheiro.</p>
          </div>
        </div>

        {/* Seletor de Data Limpo */}
        <div className="flex items-center bg-white p-1 rounded-full border shadow-sm">
          <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(Number(v))}>
            <SelectTrigger className="w-[140px] border-0 h-9 rounded-l-full focus:ring-0"><CalendarDays className="w-4 h-4 mr-2 text-slate-400" /><SelectValue /></SelectTrigger>
            <SelectContent>{[1,2,3,4,5,6,7,8,9,10,11,12].map((m) => <SelectItem key={m} value={m.toString()}>{new Date(0, m-1).toLocaleString('pt-BR', { month: 'long' })}</SelectItem>)}</SelectContent>
          </Select>
          <div className="h-4 w-[1px] bg-slate-200" />
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(Number(v))}>
            <SelectTrigger className="w-[80px] border-0 h-9 rounded-r-full focus:ring-0"><SelectValue /></SelectTrigger>
            <SelectContent>{[2023, 2024, 2025, 2026].map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="planning" className="w-full">
        <TabsList className="w-full max-w-md grid grid-cols-2 mb-8 p-1 bg-slate-100/80 backdrop-blur rounded-xl">
          <TabsTrigger value="planning" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Distribuição</TabsTrigger>
          <TabsTrigger value="incomes" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Receitas</TabsTrigger>
        </TabsList>

        {/* --- TAB 1: PLANEJAMENTO FINANCEIRO --- */}
        <TabsContent value="planning" className="space-y-8">
          
          {/* HERO CARD: RENDA PLANEJADA */}
          <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-4 flex-1">
                <Label htmlFor="income-input" className="text-slate-500 font-medium uppercase tracking-wide text-xs flex items-center gap-2">
                  <Wallet className="w-4 h-4" /> Renda total disponível para {new Date(0, selectedMonth-1).toLocaleString('pt-BR', { month: 'long' })}
                </Label>
                <div className="relative group">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-4xl font-bold text-slate-300 group-focus-within:text-blue-500 transition-colors">R$</span>
                  <Input 
                    id="income-input"
                    type="number" 
                    className="ml-14 text-5xl md:text-6xl font-bold h-auto border-none shadow-none bg-transparent focus-visible:ring-0 p-0 text-slate-900 placeholder:text-slate-200" 
                    value={plannedIncome}
                    onChange={(e) => setPlannedIncome(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <p className="text-sm text-slate-400">
                  Defina quanto dinheiro vai entrar. O app distribuirá automaticamente abaixo.
                </p>
              </div>

              {/* Sugestão Inteligente */}
              {suggestedIncome > 0 && suggestedIncome !== numericIncome && (
                <div 
                  className="flex items-center gap-3 bg-blue-50/80 backdrop-blur-sm p-3 pr-4 rounded-xl border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors group"
                  onClick={handleUseSuggestedIncome}
                >
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-700 uppercase">Sugestão Detectada</p>
                    <p className="text-sm text-blue-900 font-medium">
                      Usar R$ {suggestedIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-400 ml-2" />
                </div>
              )}
            </div>
          </div>

          {/* SLIDERS DE DISTRIBUIÇÃO */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-slate-500" /> Distribuição do Orçamento
              </h3>
              <Badge variant={isValidTotal ? "outline" : "destructive"} className={isValidTotal ? "bg-green-50 text-green-700 border-green-200" : ""}>
                Total: {totalPercentage.toFixed(0)}%
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {budgetCategories.map((bc) => {
                const percStr = editedPercentages[bc.id] || "0";
                const percNum = parseFloat(percStr) || 0;
                const amount = (numericIncome * percNum) / 100;
                const style = getFolderStyle(bc.name);
                const catsInFolder = categories.filter(c => c.budgetCategoryId === bc.id);

                return (
                  <Card key={bc.id} className={`group border-2 hover:border-opacity-100 transition-all duration-300 ${style.bg} border-transparent hover:${style.border.replace('border-', 'border-')}`}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${style.iconColor}`}>
                            <Target className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className={`font-bold text-lg ${style.color}`}>{bc.name}</h4>
                            <p className="text-slate-500 text-xs font-medium">Meta de alocação</p>
                          </div>
                        </div>
                        
                        {/* Input Manual de Porcentagem */}
                        <div className="flex items-baseline gap-1 bg-white/50 rounded-lg px-2 border border-transparent hover:border-slate-200 focus-within:border-blue-400 transition-colors">
                          <Input
                            type="number"
                            className="w-14 text-right text-2xl font-bold h-auto p-0 border-none bg-transparent focus-visible:ring-0 text-slate-900 placeholder:text-slate-300"
                            value={percStr}
                            onChange={(e) => handlePercentageChange(bc.id, e.target.value)}
                            min={0}
                            max={100}
                          />
                          <span className="text-sm font-bold text-slate-400">%</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 pt-2 space-y-6">
                      
                      <div className="text-center py-2">
                         <p className="text-2xl font-bold text-slate-800">
                            {amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                         </p>
                      </div>

                      {/* Slider Interativo */}
                      <div className="space-y-2">
                        <Slider
                          value={[percNum]}
                          max={100}
                          step={1}
                          onValueChange={(vals) => handleSliderChange(bc.id, vals[0])}
                          className="cursor-grab active:cursor-grabbing py-2"
                        />
                      </div>

                      {/* Categorias Inclusas */}
                      <div className="pt-4 border-t border-slate-200/60">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Inclui gastos como:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {catsInFolder.slice(0, 4).map(c => (
                            <span key={c.id} className="text-[11px] px-2 py-1 bg-white border border-slate-100 text-slate-600 rounded-md shadow-sm">
                              {c.name}
                            </span>
                          ))}
                          {catsInFolder.length > 4 && (
                            <span className="text-[11px] px-2 py-1 text-slate-400">+{catsInFolder.length - 4}</span>
                          )}
                          <button 
                            onClick={() => router.push("/categories")}
                            className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* FLOAT SAVE BAR */}
          <div className="fixed bottom-20 right-0 z-20 w-full max-w-md px-4">
            <div className={`bg-slate-900 text-white p-2 pr-3 rounded-full shadow-2xl flex items-center justify-between transition-all duration-300 ${isValidTotal ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"}`}>
              <div className="flex items-center gap-3 pl-4">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium">Pronto para salvar</span>
              </div>
              <Button 
                size="sm" 
                onClick={handleSaveBudget} 
                disabled={isSaving}
                className="bg-white text-slate-900 hover:bg-slate-100 rounded-full px-6 font-bold"
              >
                {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : "Confirmar"}
              </Button>
            </div>
            
            {/* Mensagem de Erro Flutuante se inválido */}
            {!isValidTotal && (
              <div className="bg-red-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center justify-center gap-2 text-sm font-medium animate-pulse">
                <AlertCircle className="w-4 h-4" /> 
                Ajuste os percentuais para somar 100% (Atual: {totalPercentage.toFixed(0)}%)
              </div>
            )}
          </div>

        </TabsContent>

        {/* --- TAB 2: RECEITAS --- */}
        <TabsContent value="incomes" className="space-y-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Minhas Fontes de Renda</h3>
              <p className="text-slate-500 text-sm">Cadastre aqui o que compõe sua renda mensal.</p>
            </div>
            <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingIncome(null)} className="rounded-full">
                  <Plus className="w-4 h-4 mr-2" /> Nova Receita
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingIncome ? "Editar Receita" : "Adicionar Receita"}</DialogTitle>
                  <DialogDescription>Informe os detalhes da entrada.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSaveIncome} className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Valor (R$)</Label>
                      <Input name="amount" type="number" step="0.01" required defaultValue={editingIncome?.amount} />
                    </div>
                    <div className="space-y-2">
                      <Label>Data</Label>
                      <Input name="date" type="date" required defaultValue={editingIncome?.date || new Date().toISOString().split('T')[0]} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Input name="description" placeholder="Ex: Salário Mensal" required defaultValue={editingIncome?.description || ""} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select name="type" defaultValue={editingIncome?.type || "recurring"}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recurring">Recorrente</SelectItem>
                          <SelectItem value="one_time">Única</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Frequência</Label>
                      <Select name="frequency" defaultValue={editingIncome?.frequency || "monthly"}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Mensal</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="yearly">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end gap-2">
                    <Button variant="ghost" type="button" onClick={() => setIsIncomeDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit" disabled={isSaving}>{isSaving ? <Loader2 className="animate-spin" /> : "Salvar"}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-slate-300 w-8 h-8" /></div>
          ) : incomes.length === 0 ? (
            <Card className="border-dashed bg-slate-50/50 border-slate-200">
              <CardContent className="py-16 text-center text-slate-500 flex flex-col items-center">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                  <Wallet className="w-8 h-8 text-slate-300" />
                </div>
                <p className="font-medium text-slate-900">Nenhuma receita cadastrada.</p>
                <p className="text-sm mb-4">Adicione seu salário ou rendas extras para começar.</p>
                <Button variant="outline" onClick={() => setIsIncomeDialogOpen(true)}>Adicionar Agora</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {incomes.map(inc => (
                <div key={inc.id} className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md hover:border-blue-100 transition-all">
                  <div className="flex items-center gap-4 mb-3 sm:mb-0">
                    <div className={`p-3 rounded-full ${inc.type === 'recurring' ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {inc.type === 'recurring' ? <RefreshCw className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-base">{inc.description}</p>
                      <p className="text-xs text-slate-500 flex gap-2 items-center mt-0.5">
                        <CalendarDays className="w-3 h-3" />
                        <span>{new Date(inc.date).toLocaleDateString()}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="capitalize">{inc.type === 'recurring' ? 'Recorrente' : 'Pontual'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end pl-14 sm:pl-0">
                    <span className="text-lg font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                      {inc.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingIncome(inc); setIsIncomeDialogOpen(true); }}>
                        <Edit2 className="w-4 h-4 text-slate-400 hover:text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteIncome(inc.id)}>
                        <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}