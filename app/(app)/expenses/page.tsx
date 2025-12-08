"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useTeam } from "@/app/(app)/team/team-provider";
import { usePermission } from "@/hooks/use-permission";
import { notify } from "@/lib/notify-helper";

import {
  useExpenses,
  useExpensesSummary,
  useDeleteExpense,
} from "@/hooks/use-expenses";
import { useCategories } from "@/hooks/use-categories";

// Types
import type { ExpenseDetailsDTO } from "@/domain/dto/expense.types.d.ts";

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
import { Plus, Search, Filter } from "lucide-react";

// Custom Components
import { ExpensesList } from "./components/expenses-list";
import { DeleteExpenseDialog } from "./components/delete-expense-dialog";
import { ExpensesTable } from "./components/expenses-table";
import { ExpensesAnalysis } from "./components/expenses-analysis";
import { ReceiptViewer } from "./components/receipt-viewer";
import { ExportExpensesDialog } from "./components/expenses-export-dialog"; // Import
import { LoadingState } from "@/components/lemon/loading-state";

const PAGE_SIZE = 20;

export default function ExpensesPage() {
  const { session, loading: authLoading } = useAuth();
  const { currentTeam } = useTeam();
  const { can } = usePermission();
  const router = useRouter();

  // --- Estados de Controle e Paginação ---
  const [page, setPage] = useState(1);

  // Observer Ref para Scroll Infinito
  const observer = useRef<IntersectionObserver | null>(null);

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
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  const teamId = currentTeam?.team.id;
  const userId = session?.user.id;

  // 1. Auth Check
  useEffect(() => {
    if (authLoading) return;
    if (!session || !userId) router.push("/auth");
    if (!teamId) router.push("/onboarding");
  }, [session, userId, teamId, authLoading, router]);

  // --- React Query Hooks ---

  // Calculate dates for filtering
  const { startDate, endDate } = useMemo(() => {
    let start: Date | undefined;
    let end: Date | undefined;

    if (filterMonth !== "all" && filterYear !== "all") {
      start = new Date(parseInt(filterYear), parseInt(filterMonth) - 1, 1);
      end = new Date(
        parseInt(filterYear),
        parseInt(filterMonth),
        0,
        23,
        59,
        59
      );
    } else if (filterYear !== "all") {
      start = new Date(parseInt(filterYear), 0, 1);
      end = new Date(parseInt(filterYear), 11, 31, 23, 59, 59);
    }
    return { startDate: start, endDate: end };
  }, [filterMonth, filterYear]);

  // Fetch Categories
  const { data: categories = [] } = useCategories(teamId);

  // Fetch Expenses
  const {
    data: expenses = [],
    isLoading: isLoadingExpenses,
    error: expensesError,
  } = useExpenses({
    teamId,
    startDate,
    endDate,
    page,
    limit: PAGE_SIZE * page, // Fetch up to current page * size to support infinite scroll behavior with RQ
    categoryId: filterCategory === "all" ? undefined : filterCategory,
  });

  // Fetch Summary
  const { data: summaryData = { total: 0, count: 0 } } = useExpensesSummary({
    teamId,
    startDate,
    endDate,
    categoryId: filterCategory === "all" ? undefined : filterCategory,
  });

  // Mutations
  const deleteMutation = useDeleteExpense();

  // Error Handling
  useEffect(() => {
    if (expensesError) {
      notify.error(expensesError, "carregar despesas");
    }
  }, [expensesError]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filterMonth, filterYear, filterCategory]);

  // Infinite Scroll Logic
  const hasMore = expenses.length >= page * PAGE_SIZE;

  const lastExpenseElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoadingExpenses) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoadingExpenses, hasMore]
  );

  // --- LÓGICA INTELIGENTE DE FILTRO ---
  const handleMonthChange = (val: string) => {
    setFilterMonth(val);
    if (val !== "all" && filterYear === "all") {
      setFilterYear(new Date().getFullYear().toString());
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

    try {
      await deleteMutation.mutateAsync({
        expenseId: expenseToDelete,
        teamId,
        userId,
      });
      notify.success("Despesa excluída.");
    } catch (err: unknown) {
      notify.error(err, "excluir despesa");
    } finally {
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
    return <LoadingState message="Carregando despesas..." />;
  }

  return (
    <div className="min-h-screen bg-background animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-6 md:flex-row md:justify-between md:items-center">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Despesas
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Gerencie seus gastos e acompanhe o fluxo.
            </p>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto bg-muted/20 p-2 rounded-2xl md:bg-transparent md:p-0">
            <div className="flex flex-col items-start md:items-end mr-2 pl-2 md:pl-0">
              <span className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Total do período
              </span>
              <span className="text-base sm:text-lg font-semibold text-foreground tabular-nums">
                R${" "}
                {summaryData.total.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <ExportExpensesDialog
              teamId={teamId}
              isPro={
                currentTeam?.subscription?.status === "active" ||
                currentTeam?.subscription?.status === "trialing"
              }
            />
            {can("MANAGE_EXPENSES") && (
              <Button
                onClick={() => router.push("/expenses/new")}
                className="rounded-xl md:rounded-full px-4 sm:px-6 shadow-button hover:shadow-button-hover transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90 text-sm sm:text-base h-10 sm:h-11"
              >
                <Plus className="w-4 h-4 mr-1.5 sm:mr-2" />
                <span className="inline">Nova Despesa</span>
              </Button>
            )}
          </div>
        </div>

        {/* Controls & Filters */}
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Top Bar: Search & View Toggle */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
            <div className="relative w-full md:max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
              <Input
                placeholder="Buscar despesas..."
                className="pl-10 h-10 sm:h-11 bg-muted/30 border-transparent focus:bg-background focus:border-input focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center bg-muted/30 p-1 rounded-lg border border-border/50 w-full md:w-auto">
              <Tabs
                value={viewMode}
                onValueChange={(v) =>
                  setViewMode(v as "list" | "table" | "analysis")
                }
                className="w-full md:w-auto"
              >
                <TabsList className="bg-transparent p-0 h-8 sm:h-9 gap-1 w-full md:w-auto grid grid-cols-3 md:flex">
                  <TabsTrigger
                    value="list"
                    className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-2 sm:px-4 text-[10px] sm:text-xs font-medium transition-all"
                  >
                    Timeline
                  </TabsTrigger>
                  <TabsTrigger
                    value="table"
                    className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-2 sm:px-4 text-[10px] sm:text-xs font-medium transition-all"
                  >
                    Tabela
                  </TabsTrigger>
                  <TabsTrigger
                    value="analysis"
                    className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-2 sm:px-4 text-[10px] sm:text-xs font-medium transition-all"
                  >
                    Análise
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Filters Row - Horizontal Scroll on Mobile */}
          <div className="flex items-center gap-2 sm:gap-3 pb-2 overflow-x-auto no-scrollbar mask-linear-fade -mx-4 px-4 sm:mx-0 sm:px-0 justify-between md:justify-start">
            <Select value={filterMonth} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[110px] sm:w-[130px] h-9 rounded-lg border-border/60 bg-background hover:bg-muted/30 transition-colors text-xs sm:text-sm flex-shrink-0">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">📅 Todos</SelectItem>
                {[...Array(12)].map((_, i) => (
                  <SelectItem key={i} value={(i + 1).toString()}>
                    {new Date(0, i).toLocaleString("pt-BR", { month: "long" })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-[80px] sm:w-[100px] h-9 rounded-lg border-border/60 bg-background hover:bg-muted/30 transition-colors text-xs sm:text-sm flex-shrink-0">
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
              <SelectTrigger className="w-[130px] sm:w-[160px] h-9 rounded-lg border-border/60 bg-background hover:bg-muted/30 transition-colors text-xs sm:text-sm flex-shrink-0">
                <div className="flex items-center gap-2 truncate">
                  <Filter className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground" />
                  <span className="truncate">
                    {filterCategory === "all"
                      ? "Categoria"
                      : categories.find((c) => c.id === filterCategory)?.name}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(filterMonth !== "all" ||
              filterYear !== "all" ||
              filterCategory !== "all" ||
              searchTerm) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-9 px-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg text-xs flex-shrink-0"
              >
                Limpar
              </Button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {isLoadingExpenses ? (
            <LoadingState message="Carregando suas despesas..." />
          ) : (
            <div className="animate-in slide-in-from-bottom-4 duration-500 fade-in">
              {expenses.length === 0 && !isLoadingExpenses ? (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 border-2 border-dashed border-muted rounded-2xl bg-muted/5">
                  <div className="bg-muted rounded-full p-4">
                    <Search className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      Nenhuma despesa encontrada
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                      Tente ajustar os filtros ou crie uma nova despesa para
                      começar.
                    </p>
                  </div>
                  {can("MANAGE_EXPENSES") && (
                    <Button
                      variant="outline"
                      onClick={handleClearFilters}
                      className="mt-2"
                    >
                      Limpar filtros
                    </Button>
                  )}
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
          )}
        </div>
      </div>

      {/* Dialogs */}
      <ReceiptViewer
        selectedReceipt={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />

      <DeleteExpenseDialog
        open={!!expenseToDelete}
        onOpenChange={(open) => !open && setExpenseToDelete(null)}
        onConfirm={confirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
