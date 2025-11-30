"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth/auth-provider";
import { useTeam } from "@/app/(app)/team/team-provider";
import { usePermission } from "@/hooks/use-permission";
import { notify } from "@/lib/notify-helper";

// Use Cases
import {
  getExpensesUseCase,
  getCategoriesUseCase,
  deleteExpenseUseCase,
  getBudgetCategoriesUseCase,
  getExpensesSummaryUseCase,
} from "@/infrastructure/dependency-injection";

// Types
import type { ExpenseDetailsDTO } from "@/domain/dto/expense.types.d.ts";
import type { CategoryDetailsDTO } from "@/domain/dto/category.types.d.ts";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Icons
import { Plus, Search, Filter, Loader2 } from "lucide-react";

// Custom Components
import { ExpensesList } from "./components/expenses-list";
import { DeleteExpenseDialog } from "./components/delete-expense-dialog";
import { ExpensesTable } from "./components/expenses-table";
import { ExpensesAnalysis } from "./components/expenses-analysis";
import { ReceiptViewer } from "./components/receipt-viewer";

const PAGE_SIZE = 20;

export default function ExpensesPage() {
  const { session, loading: authLoading } = useAuth();
  const { currentTeam } = useTeam();
  const { can } = usePermission();
  const router = useRouter();

  // --- Estados de Dados ---
  const [expenses, setExpenses] = useState<ExpenseDetailsDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDetailsDTO[]>([]);

  // --- Estados de Controle e Paginação ---
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [summaryData, setSummaryData] = useState({ total: 0, count: 0 });

  // Observer Ref para Scroll Infinito
  const observer = useRef<IntersectionObserver | null>(null);

  const lastExpenseElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoadingInitial || isLoadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoadingInitial, isLoadingMore, hasMore]
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
        const [cats] = await Promise.all([
          getCategoriesUseCase.execute(teamId),
          getBudgetCategoriesUseCase.execute(teamId),
        ]);
        setCategories(cats);
        // setBudgetCategories(budCats);
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

      // Fetch Summary ONLY on reset (filter change)
      if (isReset) {
        const summary = await getExpensesSummaryUseCase.execute({
          teamId,
          startDate,
          endDate,
          categoryId: filterCategory === "all" ? undefined : filterCategory,
        });
        setSummaryData(summary);
      }

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

  const handleDelete = (id: string) => {
    setExpenseToDelete(id);
  };

  const confirmDelete = async () => {
    if (!teamId || !userId || !expenseToDelete) return;

    setIsDeleting(expenseToDelete);
    try {
      await deleteExpenseUseCase.execute({
        expenseId: expenseToDelete,
        teamId,
        userId,
      });

      // Atualiza lista local
      const deletedExpense = expenses.find((e) => e.id === expenseToDelete);
      setExpenses((prev) => prev.filter((e) => e.id !== expenseToDelete));

      // Atualiza sumário local (Total e Contagem)
      if (deletedExpense) {
        setSummaryData((prev) => ({
          total: prev.total - deletedExpense.amount,
          count: Math.max(0, prev.count - 1),
        }));
      }

      notify.success("Despesa excluída.");
    } catch (err: any) {
      notify.error(err, "excluir despesa");
    } finally {
      setIsDeleting(null);
      setExpenseToDelete(null);
    }
  };

  const handleClearFilters = () => {
    setFilterMonth("all");
    setFilterYear("all");
    setFilterCategory("all");
    setSearchTerm("");
  };

  if (authLoading || !session || !teamId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20 animate-in fade-in">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Extrato Financeiro
            </h1>
            <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
              <span className="font-semibold text-foreground bg-card px-2 py-0.5 rounded border border-border shadow-sm">
                R${" "}
                {summaryData.total.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </span>
              <span className="text-xs">• {summaryData.count} itens</span>
            </p>
          </div>
          {can("MANAGE_EXPENSES") && (
            <Button
              onClick={() => router.push("/expenses/new")}
              className="shadow-md shadow-primary/20"
            >
              <Plus className="w-4 h-4 mr-2" /> Nova Despesa
            </Button>
          )}
        </div>

        {/* Toolbar (Non-Sticky) */}
        <div className="bg-card p-3 rounded-xl border border-border shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Busca */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar despesas..."
                className="pl-9 bg-background border-input focus:ring-primary transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtros */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              <Select value={filterMonth} onValueChange={handleMonthChange}>
                <SelectTrigger className="w-[140px] bg-background">
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
                <SelectTrigger className="w-[100px] bg-background">
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
                <SelectTrigger className="w-[150px] bg-background">
                  <div className="flex items-center gap-2 truncate">
                    <Filter className="w-3.5 h-3.5 text-muted-foreground" />
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
            <TabsList className="grid w-full grid-cols-3 h-9 bg-muted p-1">
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
            <Loader2 className="animate-spin text-primary w-10 h-10" />
            <p className="text-muted-foreground text-sm">
              Carregando transações...
            </p>
          </div>
        ) : (
          <>
            {/* 1. VIEW: TIMELINE */}
            {viewMode === "list" && (
              <ExpensesList
                groupedExpenses={groupedExpenses}
                lastExpenseElementRef={lastExpenseElementRef}
                setSelectedReceipt={setSelectedReceipt}
                handleDelete={handleDelete}
                router={router}
                hasMore={hasMore}
                onClearFilters={handleClearFilters}
              />
            )}

            {/* 2. VIEW: TABLE */}
            {viewMode === "table" && (
              <ExpensesTable
                displayedExpenses={displayedExpenses}
                lastExpenseElementRef={lastExpenseElementRef}
                setSelectedReceipt={setSelectedReceipt}
                router={router}
                hasMore={hasMore}
              />
            )}

            {/* 3. VIEW: ANALYSIS */}
            {viewMode === "analysis" && (
              <ExpensesAnalysis
                summaryData={summaryData}
                displayedExpenses={displayedExpenses}
                categories={categories}
              />
            )}
          </>
        )}
      </div>

      {/* MODAL DE COMPROVANTE */}
      <ReceiptViewer
        selectedReceipt={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />

      <DeleteExpenseDialog
        open={!!expenseToDelete}
        onOpenChange={(open) => !open && setExpenseToDelete(null)}
        onConfirm={confirmDelete}
        isDeleting={!!isDeleting}
      />
    </div>
  );
}
