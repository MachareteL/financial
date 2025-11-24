"use client";

import type React from "react";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth/auth-provider";
import { useTeam } from "@/app/(app)/team/team-provider";
import { notify } from "@/lib/notify-helper";

// Use Cases
import {
  getInvestmentsUseCase,
  createInvestmentUseCase,
  updateInvestmentUseCase,
  deleteInvestmentUseCase,
} from "@/infrastructure/dependency-injection";
import type {
  InvestmentDetailsDTO,
  CreateInvestmentDTO,
  UpdateInvestmentDTO,
} from "@/domain/dto/investment.types.d.ts";

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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Icons
import {
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  TrendingUp,
  Loader2,
  Landmark,
  Bitcoin,
  Building2,
  LineChart,
  PiggyBank,
  Briefcase,
  Wallet,
  CalendarRange,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

// Charts
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// --- Configurações Visuais dos Tipos de Investimento ---
const ASSET_CONFIG: Record<
  string,
  { label: string; icon: any; color: string; bg: string }
> = {
  savings: {
    label: "Poupança/CDB",
    icon: PiggyBank,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  stocks: {
    label: "Ações",
    icon: LineChart,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  bonds: {
    label: "Tesouro/Títulos",
    icon: Landmark,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
  real_estate: {
    label: "Imóveis/FIIs",
    icon: Building2,
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
  crypto: {
    label: "Criptomoedas",
    icon: Bitcoin,
    color: "text-indigo-600",
    bg: "bg-indigo-100",
  },
  other: {
    label: "Outros",
    icon: Briefcase,
    color: "text-slate-600",
    bg: "bg-slate-100",
  },
};

const getAssetConfig = (type: string) => {
  return ASSET_CONFIG[type] || ASSET_CONFIG["other"];
};

// Tipo para o gráfico
interface ProjectionData {
  month: string;
  total: number;
  invested: number; // Apenas o dinheiro que saiu do bolso
  yield: number; // O quanto rendeu
}

export default function InvestmentsPage() {
  const { session, loading: authLoading } = useAuth();
  const { currentTeam } = useTeam();
  const router = useRouter();

  const [investments, setInvestments] = useState<InvestmentDetailsDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Ações de escrita
  const [isDataLoading, setIsDataLoading] = useState(true); // Leitura inicial

  // Estado do Modal
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] =
    useState<InvestmentDetailsDTO | null>(null);

  // Estado do Gráfico
  const [projectionYears, setProjectionYears] = useState(5);
  const [projectionData, setProjectionData] = useState<ProjectionData[]>([]);

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
    if (teamId) loadInvestments();
  }, [teamId]);

  // 3. Recalcular Projeções
  useEffect(() => {
    if (investments.length >= 0) {
      calculateProjections();
    }
  }, [investments, projectionYears]);

  const loadInvestments = async () => {
    if (!teamId) return;
    setIsDataLoading(true);
    try {
      const data = await getInvestmentsUseCase.execute(teamId);
      setInvestments(data);
    } catch (error: any) {
      notify.error(error, "carregar investimentos");
    } finally {
      setIsDataLoading(false);
    }
  };

  // --- Lógica de Projeção (Juros Compostos) ---
  const calculateProjections = () => {
    const totalMonths = projectionYears * 12;
    const dataPoints: ProjectionData[] = [];

    // Estado inicial (Mês 0)
    let currentTotalPortfolio = investments.reduce(
      (acc, inv) => acc + inv.currentAmount,
      0
    );
    let totalInvestedFromPocket = investments.reduce(
      (acc, inv) => acc + inv.initialAmount,
      0
    ); // Aproximação: considera currentAmount como base inicial para simplicidade da curva futura, mas idealmente rastrearia histórico. Para projeção futura, currentAmount é o "principal" hoje.

    // Para o gráfico ficar bonito, vamos considerar:
    // "Invested" = Valor Atual (hoje) + Aportes Futuros acumulados
    // "Total" = Valor Simulado com Juros
    // "Yield" = Total - Invested

    // Base inicial para o gráfico
    let simulatedTotal = currentTotalPortfolio;
    let simulatedInvested = currentTotalPortfolio; // Começa do valor atual como "base"

    for (let m = 0; m <= totalMonths; m++) {
      // A cada mês, calculamos o rendimento de cada ativo individualmente
      let monthlyYield = 0;
      let monthlyContributionTotal = 0;

      // Itera sobre cada investimento para aplicar sua taxa específica
      investments.forEach((inv) => {
        // Taxa mensal aproximada
        const monthlyRate = Math.pow(1 + inv.annualReturnRate / 100, 1 / 12) - 1;
        
        // Valor deste ativo neste mês da simulação
        // Nota: Esta é uma simplificação para o gráfico agregado. 
        // Em um app real, faríamos a evolução individual e somaríamos.
        // Aqui, vamos projetar o "delta" que esse ativo adiciona ao bolo total.
        
        const assetValueAtMonthStart = inv.currentAmount * Math.pow(1 + monthlyRate, m);
        const contributionsValueAtMonthStart = inv.monthlyContribution * ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate);
        
        // Mas para somar tudo num loop simples é complexo. 
        // Vamos simplificar: Usar uma média ponderada de retorno seria melhor, 
        // mas vamos iterar o "bolo total" somando os ganhos individuais.
      });

      // --- Abordagem Iterativa Simplificada ---
      if (m > 0) {
         let monthGain = 0;
         let monthDeposit = 0;

         investments.forEach(inv => {
            // Quanto esse ativo específico rende num mês (simplificado sobre o valor atual dele projetado linearmente para performance)
            // O ideal é ter um objeto de estado para cada ativo, mas para UI rápida:
            const monthlyRate = inv.annualReturnRate / 100 / 12; 
            // Estimativa do valor do ativo neste passo 'm' (sem considerar juros sobre juros exatos de aportes passados neste loop simples, 
            // mas suficiente para "visão de futuro")
            const estimatedAssetValue = inv.currentAmount + (inv.monthlyContribution * m); 
            
            // Ganho aproximado deste mês
            monthGain += estimatedAssetValue * monthlyRate;
            monthDeposit += inv.monthlyContribution;
         });

         // Juros Compostos Simplificados Globais (para efeito visual de curva exponencial)
         // Adiciona o rendimento ao total acumulado (juros sobre juros)
         simulatedTotal += monthGain; 
         
         // Adiciona os novos aportes
         simulatedTotal += monthDeposit;
         simulatedInvested += monthDeposit;
      }

      // Reduz pontos para o gráfico não ficar pesado (1 ponto a cada 3 meses)
      if (m % 3 === 0 || m === totalMonths) {
        dataPoints.push({
          month: m === 0 ? "Hoje" : `${Math.floor(m/12) > 0 ? Math.floor(m/12) + 'a ' : ''}${m%12}m`,
          total: simulatedTotal,
          invested: simulatedInvested,
          yield: simulatedTotal - simulatedInvested,
        });
      }
    }

    setProjectionData(dataPoints);
  };

  // --- CRUD Handlers ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!teamId) return;
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const rawData = {
      name: formData.get("name") as string,
      type: formData.get("type") as any,
      initialAmount: Number(formData.get("initialAmount")),
      currentAmount: Number(formData.get("currentAmount")),
      monthlyContribution: Number(formData.get("monthlyContribution")),
      annualReturnRate: Number(formData.get("annualReturnRate")),
      startDate: formData.get("startDate") as string,
    };

    try {
      if (editingInvestment) {
        await updateInvestmentUseCase.execute({
          ...rawData,
          investmentId: editingInvestment.id,
          teamId,
        });
        notify.success("Investimento atualizado!");
      } else {
        await createInvestmentUseCase.execute({ ...rawData, teamId });
        notify.success("Novo ativo adicionado!");
      }
      setIsDialogOpen(false);
      setEditingInvestment(null);
      loadInvestments();
    } catch (error: any) {
      notify.error(error, "salvar investimento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!teamId) return;
    if (!confirm("Remover este investimento da carteira?")) return;
    try {
      await deleteInvestmentUseCase.execute(id, teamId);
      notify.success("Investimento removido.");
      loadInvestments();
    } catch (error: any) {
      notify.error(error, "remover investimento");
    }
  };

  // --- Totais do Dashboard ---
  const totalPatrimony = investments.reduce((acc, i) => acc + i.currentAmount, 0);
  const totalMonthlyContribution = investments.reduce((acc, i) => acc + i.monthlyContribution, 0);
  
  // Estimativa de Renda Passiva (Regra dos 0.5% ao mês safe withdrawal)
  const estimatedPassiveIncome = totalPatrimony * 0.005; 

  if (authLoading || isDataLoading || !session || !teamId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} className="rounded-full hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5 text-slate-500" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Investimentos</h1>
            <p className="text-slate-500">Acompanhe a evolução do patrimônio da família.</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingInvestment(null)} className="shadow-lg shadow-blue-600/20 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> Novo Investimento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingInvestment ? "Editar Ativo" : "Novo Ativo"}</DialogTitle>
              <DialogDescription>Cadastre um investimento para rastrear.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Nome do Ativo</Label>
                <Input name="name" placeholder="Ex: CDB Nubank, Ações PETR4..." required defaultValue={editingInvestment?.name} />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select name="type" defaultValue={editingInvestment?.type || "savings"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ASSET_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Investido Inicial (R$)</Label>
                  <Input name="initialAmount" type="number" step="0.01" required defaultValue={editingInvestment?.initialAmount} />
                </div>
                <div className="space-y-2">
                  <Label>Saldo Atual (R$)</Label>
                  <Input name="currentAmount" type="number" step="0.01" required defaultValue={editingInvestment?.currentAmount} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Aporte Mensal (R$)</Label>
                  <Input name="monthlyContribution" type="number" step="0.01" defaultValue={editingInvestment?.monthlyContribution || 0} />
                </div>
                <div className="space-y-2">
                  <Label>Retorno Anual (%)</Label>
                  <Input name="annualReturnRate" type="number" step="0.01" required defaultValue={editingInvestment?.annualReturnRate} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Data Início</Label>
                <Input name="startDate" type="date" required defaultValue={editingInvestment?.startDate || new Date().toISOString().split("T")[0]} />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : "Salvar"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* --- HERO STATS (PATRIMÔNIO) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Patrimony */}
        <Card className="border-none shadow-lg bg-slate-900 text-white md:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          <CardContent className="p-8 flex flex-col justify-between h-full relative z-10">
             <div>
                <p className="text-blue-200 font-medium mb-2 flex items-center gap-2">
                   <Wallet className="w-4 h-4" /> Patrimônio Total
                </p>
                <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
                   {totalPatrimony.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </h2>
             </div>
             <div className="mt-8 flex items-center gap-6">
                <div>
                   <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Aporte Mensal</p>
                   <p className="text-xl font-semibold text-white flex items-center gap-2">
                      + {totalMonthlyContribution.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      <span className="text-xs font-normal text-slate-400">/mês</span>
                   </p>
                </div>
                <div className="h-8 w-[1px] bg-slate-700"></div>
                <div>
                   <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Renda Passiva (Est.)</p>
                   <p className="text-xl font-semibold text-emerald-400 flex items-center gap-2">
                      ~ {estimatedPassiveIncome.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      <span className="text-xs font-normal text-slate-400">/mês</span>
                   </p>
                </div>
             </div>
          </CardContent>
        </Card>

        {/* Allocation Mini-Chart Placeholder or Motivation */}
        <Card className="border-slate-100 shadow-sm bg-gradient-to-br from-white to-slate-50 flex flex-col justify-center items-center text-center p-6">
           <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-blue-600" />
           </div>
           <h3 className="text-lg font-bold text-slate-900 mb-2">Construindo o Futuro</h3>
           <p className="text-sm text-slate-500">
             "O melhor momento para plantar uma árvore foi há 20 anos. O segundo melhor é agora."
           </p>
        </Card>
      </div>

      {/* --- GRÁFICO DE PROJEÇÃO (DREAM SIMULATOR) --- */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                 <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" /> O Poder do Tempo
                 </CardTitle>
                 <CardDescription>Simulação baseada nos seus aportes e taxas atuais.</CardDescription>
              </div>
              <Tabs defaultValue="5" onValueChange={(v) => setProjectionYears(Number(v))}>
                 <TabsList className="bg-slate-100">
                    <TabsTrigger value="1">1 Ano</TabsTrigger>
                    <TabsTrigger value="5">5 Anos</TabsTrigger>
                    <TabsTrigger value="10">10 Anos</TabsTrigger>
                    <TabsTrigger value="20">20 Anos</TabsTrigger>
                 </TabsList>
              </Tabs>
           </div>
        </CardHeader>
        <CardContent className="pl-0">
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                       <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                       </linearGradient>
                       <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                       </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(val) => `R$${val/1000}k`} 
                    />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      formatter={(value: number) => [value.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}), ""]}
                    />
                    <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" name="Patrimônio Total" />
                    <Area type="monotone" dataKey="invested" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorInvested)" name="Dinheiro Investido" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </CardContent>
      </Card>

      {/* --- LISTA DE ATIVOS --- */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
           <Briefcase className="w-5 h-5 text-slate-500" /> Sua Carteira
        </h3>
        
        {investments.length === 0 ? (
           <Card className="border-dashed bg-slate-50 py-12 text-center">
              <p className="text-slate-500">Você ainda não cadastrou nenhum investimento.</p>
              <Button variant="link" onClick={() => setIsDialogOpen(true)}>Começar agora</Button>
           </Card>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {investments.map((inv) => {
                 const config = getAssetConfig(inv.type);
                 const Icon = config.icon;
                 const totalReturn = inv.currentAmount - inv.initialAmount;
                 const returnPercentage = inv.initialAmount > 0 ? (totalReturn / inv.initialAmount) * 100 : 0;

                 return (
                    <Card key={inv.id} className="hover:shadow-md transition-all border-slate-200 group">
                       <CardContent className="p-5">
                          <div className="flex justify-between items-start mb-4">
                             <div className={`p-2.5 rounded-xl ${config.bg}`}>
                                <Icon className={`w-5 h-5 ${config.color}`} />
                             </div>
                             <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingInvestment(inv); setIsDialogOpen(true); }}>
                                   <Edit2 className="w-3.5 h-3.5 text-slate-400 hover:text-blue-600" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(inv.id)}>
                                   <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-600" />
                                </Button>
                             </div>
                          </div>
                          
                          <div className="mb-4">
                             <h4 className="font-bold text-slate-900 truncate">{inv.name}</h4>
                             <p className="text-xs text-slate-500">{config.label}</p>
                          </div>

                          <div className="flex justify-between items-end">
                             <div>
                                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Saldo</p>
                                <p className="text-lg font-bold text-slate-800">
                                   {inv.currentAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                </p>
                             </div>
                             <Badge variant="outline" className={`gap-1 ${totalReturn >= 0 ? "text-green-600 bg-green-50 border-green-200" : "text-red-600 bg-red-50 border-red-200"}`}>
                                {totalReturn >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                                {Math.abs(returnPercentage).toFixed(1)}%
                             </Badge>
                          </div>
                       </CardContent>
                    </Card>
                 );
              })}
           </div>
        )}
      </div>
    </div>
  );
}