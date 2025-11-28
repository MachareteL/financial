"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth/auth-provider";
import { useTeam } from "@/app/(app)/team/team-provider";
import { notify } from "@/lib/notify-helper";

// Use Cases
import {
  getExpensesUseCase,
  getCategoriesUseCase,
  deleteExpenseUseCase,
  getBudgetCategoriesUseCase,
} from "@/infrastructure/dependency-injection";

// Types
import type { ExpenseDetailsDTO } from "@/domain/dto/expense.types.d.ts";
import type { CategoryDetailsDTO } from "@/domain/dto/category.types.d.ts";
import type { BudgetCategoryDetailsDTO } from "@/domain/dto/budget-category.types.d.ts";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Icons
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2,
  ShoppingBag,
  Home,
  PiggyBank,
  Wallet,
  CreditCard,
  Repeat,
  X,
  FileText,
  Paperclip,
  CalendarDays,
  Calendar,
  ArrowDown,
} from "lucide-react";

// --- CONFIGURAÇÃO DE CORES E ÍCONES ---
const FOLDER_ICONS: Record<string, any> = {
  Necessidades: Home,
  Desejos: ShoppingBag,
  Poupança: PiggyBank,
  Investimentos: PiggyBank,
  Outros: Wallet,
};

// Estilos modernos para Badges e Ícones
const FOLDER_STYLES: Record<
  string,
  { bg: string; text: string; border: string; badge: string }
> = {
  Necessidades: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-100",
    badge: "bg-blue-100/50 text-blue-700 hover:bg-blue-200 border-blue-200",
  },
  Desejos: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-100",
    badge:
      "bg-purple-100/50 text-purple-700 hover:bg-purple-200 border-purple-200",
  },
  Poupança: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-100",
    badge:
      "bg-emerald-100/50 text-emerald-700 hover:bg-emerald-200 border-emerald-200",
  },
  Investimentos: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-100",
    badge:
      "bg-emerald-100/50 text-emerald-700 hover:bg-emerald-200 border-emerald-200",
  },
  Outros: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-100",
    badge: "bg-slate-100/50 text-slate-700 hover:bg-slate-200 border-slate-200",
  },
};

const getCategoryStyle = (folderName: string | null) => {
  const name = folderName || "Outros";
  const key =
    Object.keys(FOLDER_ICONS).find((k) => name.includes(k)) || "Outros";
  return {
    icon: FOLDER_ICONS[key],
    theme: FOLDER_STYLES[key] || FOLDER_STYLES["Outros"],
  };
};

const PAGE_SIZE = 20;

export default function ExpensesPage() {
  const { session, loading: authLoading } = useAuth();
  const { currentTeam } = useTeam();
  const router = useRouter();

  // --- Estados de Dados ---
  const [expenses, setExpenses] = useState<ExpenseDetailsDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDetailsDTO[]>([]);
  const [budgetCategories, setBudgetCategories] = useState<
    BudgetCategoryDetailsDTO[]
  >([]);

  // --- Estados de Controle e Paginação ---
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Observer Ref para Scroll Infinito
  const observer = useRef<IntersectionObserver | null>(null);

  const lastExpenseElementRef = useCallback(
    (node: HTMLTableRowElement | HTMLDivElement | null) => {
      if (isLoadingMore || isLoadingInitial) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setPage((prevPage) => prevPage + 1);
          }
        },
        { threshold: 0.5 }
      );

      if (node) observer.current.observe(node);
    },
    [isLoadingMore, isLoadingInitial, hasMore]
  );

  // --- Filtros e View ---
  const [viewMode, setViewMode] = useState<"list" | "table" | "analysis">(
    "list"
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Filtros de Data e Categoria
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // --- Modal de Recibo ---
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  const teamId = currentTeam?.team.id;
  const userId = session?.user.id;

  // 1. Auth Check
  useEffect(() => {
    if (authLoading) return;
    if (!session || !userId) router.push("/auth");
    if (!teamId) router.push("/onboarding");
  }, [session, userId, teamId, authLoading, router]);

  // 2. Load Aux Data
  useEffect(() => {
    if (!teamId) return;
    const loadAuxData = async () => {
      try {
        const [cats, budCats] = await Promise.all([
          getCategoriesUseCase.execute(teamId),
          getBudgetCategoriesUseCase.execute(teamId),
        ]);
        setCategories(cats);
        setBudgetCategories(budCats);
      } catch (err) {
        console.error(err);
      }
    };
    loadAuxData();
  }, [teamId]);

  // 3. Reset Effect
  useEffect(() => {
    if (!teamId) return;
    setPage(1);
    setHasMore(true);
    setExpenses([]);
    setIsLoadingInitial(true);
    fetchExpenses(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId, filterMonth, filterYear, filterCategory]);

  // 4. Scroll Effect
  useEffect(() => {
    if (page > 1) fetchExpenses(page, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // --- LÓGICA INTELIGENTE DE FILTRO ---
  const handleMonthChange = (val: string) => {
    setFilterMonth(val);
    // Se selecionou um mês específico E o ano está em "Todos",
    // assume que o usuário quer o ano atual (UX Improvement)
    if (val !== "all" && filterYear === "all") {
      setFilterYear(new Date().getFullYear().toString());
    }
  };

  // 5. Fetch Data
  const fetchExpenses = async (pageToLoad: number, isReset: boolean) => {
    if (!teamId) return;
    if (!isReset) setIsLoadingMore(true);

    try {
      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (filterMonth !== "all" && filterYear !== "all") {
        startDate = new Date(
          parseInt(filterYear),
          parseInt(filterMonth) - 1,
          1
        );
        endDate = new Date(
          parseInt(filterYear),
          parseInt(filterMonth),
          0,
          23,
          59,
          59
        );
      } else if (filterYear !== "all") {
        startDate = new Date(parseInt(filterYear), 0, 1);
        endDate = new Date(parseInt(filterYear), 11, 31, 23, 59, 59);
      }

      const newExpenses = await getExpensesUseCase.execute({
        teamId,
        startDate,
        endDate,
        page: pageToLoad,
        limit: PAGE_SIZE,
      });

      let filteredResult = newExpenses;
      if (filterCategory !== "all") {
        filteredResult = filteredResult.filter(
          (e) => e.categoryId === filterCategory
        );
      }

      if (newExpenses.length < PAGE_SIZE) {
        setHasMore(false);
      }

      setExpenses((prev) =>
        isReset ? filteredResult : [...prev, ...filteredResult]
      );
    } catch (error: any) {
      notify.error(error, "carregar despesas");
    } finally {
      setIsLoadingInitial(false);
      setIsLoadingMore(false);
    }
  };

  // 6. Search Filter (Client Side)
  const displayedExpenses = useMemo(() => {
    if (!searchTerm) return expenses;
    const lower = searchTerm.toLowerCase();
    return expenses.filter(
      (e) =>
        e.description?.toLowerCase().includes(lower) ||
        e.amount.toString().includes(lower) ||
        e.category?.name.toLowerCase().includes(lower)
    );
  }, [expenses, searchTerm]);

  // 7. Grouping Logic
  const groupedExpenses = useMemo(() => {
    const groups: Record<string, ExpenseDetailsDTO[]> = {};
    displayedExpenses.forEach((e) => {
      const date = new Date(e.date.replace(/-/g, "/"));
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      let key = date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        weekday: "long",
      });
      if (date.toDateString() === today.toDateString()) key = "Hoje";
      else if (date.toDateString() === yesterday.toDateString()) key = "Ontem";

      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });
    return groups;
  }, [displayedExpenses]);

  const totalDisplay = displayedExpenses.reduce(
    (acc, curr) => acc + curr.amount,
    0
  );

  const handleDelete = async (id: string) => {
    if (!teamId || !confirm("Excluir este gasto?")) return;
    try {
      await deleteExpenseUseCase.execute({ expenseId: id, teamId });
      notify.success("Gasto excluído.");
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      notify.error(err, "excluir gasto");
    }
  };

  if (authLoading || !session || !teamId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 pb-20 animate-in fade-in">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Extrato Financeiro
            </h1>
            <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
              <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm">
                R${" "}
                {totalDisplay.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </span>
              <span className="text-xs">
                • {displayedExpenses.length} itens
              </span>
            </p>
          </div>
          <Button
            onClick={() => router.push("/expenses/new")}
            className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200"
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Gasto
          </Button>
        </div>

        {/* Toolbar Sticky */}
        <div className="sticky top-4 z-30 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Busca */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar gastos..."
                className="pl-9 bg-white border-slate-200 focus:ring-blue-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtros */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              <Select value={filterMonth} onValueChange={handleMonthChange}>
                <SelectTrigger className="w-[140px] bg-white">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">📅 Todos</SelectItem>
                  {[...Array(12)].map((_, i) => (
                    <SelectItem key={i} value={(i + 1).toString()}>
                      {new Date(0, i).toLocaleString("pt-BR", {
                        month: "long",
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-[100px] bg-white">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {[2023, 2024, 2025, 2026].map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[150px] bg-white">
                  <div className="flex items-center gap-2 truncate">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">
                      {filterCategory === "all"
                        ? "Categoria"
                        : categories.find((c) => c.id === filterCategory)?.name}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs
            value={viewMode}
            onValueChange={(v) =>
              setViewMode(v as "list" | "table" | "analysis")
            }
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 h-9 bg-slate-100/50 p-1">
              <TabsTrigger value="list" className="text-xs font-medium">
                Timeline
              </TabsTrigger>
              <TabsTrigger value="table" className="text-xs font-medium">
                Tabela
              </TabsTrigger>
              <TabsTrigger value="analysis" className="text-xs font-medium">
                Análise
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* --- MAIN CONTENT --- */}
        {isLoadingInitial ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
            <p className="text-slate-500 text-sm">Carregando transações...</p>
          </div>
        ) : (
          <>
            {/* 1. VIEW: TIMELINE */}
            {viewMode === "list" && (
              <div className="space-y-8">
                {Object.entries(groupedExpenses).length === 0 ? (
                  <EmptyState />
                ) : (
                  Object.entries(groupedExpenses).map(
                    ([dateLabel, items], groupIndex) => (
                      <div key={dateLabel} className="space-y-3">
                        <div className="sticky top-[140px] z-20 flex justify-center pointer-events-none">
                          <div className="bg-slate-800/90 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm uppercase tracking-widest flex items-center gap-2">
                            <CalendarDays className="w-3 h-3" />
                            {dateLabel}
                          </div>
                        </div>

                        {items.map((expense, index) => {
                          const { icon: Icon, theme } = getCategoryStyle(
                            expense.category?.budgetCategoryName || null
                          );
                          const isLastItem =
                            groupIndex ===
                              Object.entries(groupedExpenses).length - 1 &&
                            index === items.length - 1;

                          return (
                            <div
                              key={expense.id}
                              ref={
                                isLastItem
                                  ? (lastExpenseElementRef as any)
                                  : null
                              }
                              onClick={() =>
                                router.push(`/expenses/${expense.id}/edit`)
                              }
                              className="group relative bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer overflow-hidden"
                            >
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-blue-500 transition-colors"></div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${theme.bg} ${theme.text} border ${theme.border} transition-colors`}
                                  >
                                    <Icon className="w-6 h-6" />
                                  </div>

                                  <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2">
                                      <p className="font-bold text-slate-800 text-base">
                                        {expense.description}
                                      </p>
                                      {expense.receiptUrl && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedReceipt(
                                              expense.receiptUrl!
                                            );
                                          }}
                                          className="p-1 rounded-full bg-slate-50 hover:bg-blue-100 text-slate-400 hover:text-blue-600 transition-colors"
                                        >
                                          <Paperclip className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 text-xs">
                                      <Badge
                                        variant="outline"
                                        className={`font-medium border px-2 py-0.5 ${theme.badge} border-transparent`}
                                      >
                                        {expense.category?.name}
                                      </Badge>

                                      {expense.isInstallment && (
                                        <span className="flex items-center gap-1 text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-md font-medium border border-purple-100">
                                          <CreditCard className="w-3 h-3" />{" "}
                                          {expense.installmentNumber}/
                                          {expense.totalInstallments}
                                        </span>
                                      )}
                                      {expense.isRecurring && (
                                        <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md font-medium border border-blue-100">
                                          <Repeat className="w-3 h-3" /> Fixa
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                  <span className="text-base font-bold text-slate-900">
                                    - R${" "}
                                    {expense.amount.toLocaleString("pt-BR", {
                                      minimumFractionDigits: 2,
                                    })}
                                  </span>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-300 hover:text-slate-600 -mr-2"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <MoreHorizontal className="w-5 h-5" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() =>
                                          router.push(
                                            `/expenses/${expense.id}/edit`
                                          )
                                        }
                                      >
                                        <Edit className="w-4 h-4 mr-2" /> Editar
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleDelete(expense.id)}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />{" "}
                                        Excluir
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )
                  )
                )}

                {hasMore && (
                  <div className="flex justify-center py-6 opacity-50">
                    <Loader2 className="animate-spin w-6 h-6 text-slate-400" />
                  </div>
                )}
              </div>
            )}

            {/* 2. VIEW: TABLE (MODERNA) */}
            {viewMode === "table" && (
              <Card className="border-none shadow-sm overflow-hidden bg-white ring-1 ring-slate-200">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50 border-b border-slate-100">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-[140px] font-semibold text-xs uppercase tracking-wider text-slate-500">
                            Data
                          </TableHead>
                          <TableHead className="font-semibold text-xs uppercase tracking-wider text-slate-500">
                            Descrição
                          </TableHead>
                          <TableHead className="font-semibold text-xs uppercase tracking-wider text-slate-500">
                            Categoria
                          </TableHead>
                          <TableHead className="text-center w-[80px] font-semibold text-xs uppercase tracking-wider text-slate-500">
                            Nota
                          </TableHead>
                          <TableHead className="text-right font-semibold text-xs uppercase tracking-wider text-slate-500">
                            Valor
                          </TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayedExpenses.map((expense, index) => {
                          const isLastItem =
                            index === displayedExpenses.length - 1;
                          const { theme } = getCategoryStyle(
                            expense.category?.budgetCategoryName || null
                          );

                          return (
                            <TableRow
                              key={expense.id}
                              className="group hover:bg-slate-50/80 transition-colors border-slate-50"
                              ref={isLastItem ? lastExpenseElementRef : null}
                            >
                              <TableCell className="text-slate-500 font-medium text-xs whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className="bg-slate-100 p-1.5 rounded-md text-slate-500">
                                    <Calendar className="w-3 h-3" />
                                  </div>
                                  {new Date(
                                    expense.date.replace(/-/g, "/")
                                  ).toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-semibold text-slate-700 text-sm group-hover:text-blue-700 transition-colors">
                                    {expense.description}
                                  </span>
                                  {expense.isInstallment && (
                                    <span className="text-[10px] text-purple-600 font-bold flex items-center gap-1 mt-0.5">
                                      <CreditCard className="w-2.5 h-2.5" />{" "}
                                      Parcela {expense.installmentNumber}/
                                      {expense.totalInstallments}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`font-medium border border-transparent ${theme.badge} py-1`}
                                >
                                  {expense.category?.name}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                {expense.receiptUrl ? (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-blue-500 bg-blue-50/50 hover:bg-blue-100 rounded-lg mx-auto transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedReceipt(expense.receiptUrl!);
                                    }}
                                    title="Ver Comprovante"
                                  >
                                    <FileText className="w-4 h-4" />
                                  </Button>
                                ) : (
                                  <span className="text-slate-300 text-xs">
                                    -
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right font-bold text-slate-900 tabular-nums">
                                R${" "}
                                {expense.amount.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                })}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-blue-600 transition-all"
                                  onClick={() =>
                                    router.push(`/expenses/${expense.id}/edit`)
                                  }
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {hasMore && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-4">
                              <div className="flex justify-center">
                                <Loader2 className="animate-spin text-slate-400 w-5 h-5" />
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 3. VIEW: ANALYSIS */}
            {viewMode === "analysis" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Distribuição (Visível)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {budgetCategories.map((bc) => {
                      const catsInFolder = categories
                        .filter((c) => c.budgetCategoryId === bc.id)
                        .map((c) => c.id);
                      const spent = displayedExpenses
                        .filter((e) => catsInFolder.includes(e.categoryId))
                        .reduce((sum, e) => sum + e.amount, 0);

                      if (spent === 0) return null;
                      const percentage =
                        totalDisplay > 0 ? (spent / totalDisplay) * 100 : 0;
                      const { theme, icon: Icon } = getCategoryStyle(bc.name);

                      return (
                        <div key={bc.id} className="group">
                          <div className="flex justify-between items-center mb-2 text-sm">
                            <div className="flex items-center gap-2">
                              <div
                                className={`p-1.5 rounded-lg ${theme.bg} ${theme.text}`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="font-semibold text-slate-700">
                                {bc.name}
                              </span>
                            </div>
                            <span className="font-bold text-slate-900">
                              R${" "}
                              {spent.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <Progress
                            value={percentage}
                            className="h-2.5 bg-slate-100"
                            indicatorClassName={theme.bg
                              .replace("bg-", "bg-")
                              .replace("50", "500")}
                          />
                          <p className="text-xs text-slate-400 text-right mt-1 font-medium">
                            {percentage.toFixed(1)}%
                          </p>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL DE COMPROVANTE */}
      <Dialog
        open={!!selectedReceipt}
        onOpenChange={(open) => !open && setSelectedReceipt(null)}
      >
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none flex justify-center items-center h-[90vh]">
          <div className="relative bg-white rounded-xl overflow-hidden shadow-2xl max-h-full max-w-full flex flex-col w-full h-full md:w-auto md:h-auto">
            <div className="absolute top-2 right-2 z-50">
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full bg-white/90 hover:bg-white shadow-md backdrop-blur-sm"
                onClick={() => setSelectedReceipt(null)}
              >
                <X className="w-5 h-5 text-slate-700" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto bg-slate-100/50 p-4 flex items-center justify-center min-w-[300px] min-h-[300px]">
              {selectedReceipt &&
                (selectedReceipt.endsWith(".pdf") ? (
                  <iframe
                    src={selectedReceipt}
                    className="w-[800px] h-[600px] rounded-lg shadow-inner bg-white"
                  />
                ) : (
                  <img
                    src={selectedReceipt}
                    alt="Comprovante"
                    className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-sm"
                  />
                ))}
            </div>
            <div className="bg-white p-3 border-t border-slate-100 flex justify-between items-center">
              <p className="text-sm font-medium text-slate-600 pl-2">
                Visualização do Anexo
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(selectedReceipt!, "_blank")}
              >
                Abrir Original <ArrowDown className="w-3 h-3 ml-2" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 animate-in fade-in zoom-in-95">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <CalendarDays className="w-10 h-10 text-slate-300" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">
        Nenhum gasto encontrado
      </h3>
      <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">
        Seus filtros não retornaram resultados ou você ainda não gastou nada
        (parabéns!).
      </p>
    </div>
  );
}
