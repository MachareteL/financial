"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  Receipt,
  Eye,
  Search,
  Filter,
  Calendar,
  Tag,
  Loader2,
  Folder,
} from "lucide-react";
import { useAuth } from "@/app/auth/auth-provider";
import { toast } from "@/hooks/use-toast";

import {
  getExpensesUseCase,
  getCategoriesUseCase,
  deleteExpenseUseCase,
  getBudgetCategoriesUseCase,
} from "@/infrastructure/dependency-injection";
import type { ExpenseDetailsDTO } from "@/domain/dto/expense.types.d.ts";
import type { CategoryDetailsDTO } from "@/domain/dto/category.types.d.ts";
import type { BudgetCategoryDetailsDTO } from "@/domain/dto/budget-category.types.d.ts";

const BUDGET_CATEGORY_COLORS: Record<string, string> = {
  Necessidades: "bg-green-100 text-green-800",
  Desejos: "bg-yellow-100 text-yellow-800",
  Poupança: "bg-blue-100 text-blue-800",
};

export default function ExpensesPage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();

  const [expenses, setExpenses] = useState<ExpenseDetailsDTO[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<ExpenseDetailsDTO[]>(
    []
  );
  const [categories, setCategories] = useState<CategoryDetailsDTO[]>([]);
  const [budgetCategories, setBudgetCategories] = useState<
    BudgetCategoryDetailsDTO[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBudgetCategory, setSelectedBudgetCategory] =
    useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-desc");

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
  }, [teamId]);

  useEffect(() => {
    applyFilters();
  }, [
    expenses,
    searchTerm,
    selectedMonth,
    selectedYear,
    selectedCategory,
    selectedBudgetCategory,
    sortBy,
  ]);

  const loadAllData = async () => {
    if (!teamId) return;
    setIsLoading(true);
    try {
      const [expensesData, categoriesData, budgetCategoriesData] =
        await Promise.all([
          getExpensesUseCase.execute({ teamId }),
          getCategoriesUseCase.execute(teamId),
          getBudgetCategoriesUseCase.execute(teamId),
        ]);

      setExpenses(expensesData);
      setCategories(categoriesData);
      setBudgetCategories(budgetCategoriesData);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const safeNewDate = (dateStr: string): Date => {
    return new Date(dateStr.replace(/-/g, "/"));
  };

  const applyFilters = () => {
    let filtered = [...expenses];

    if (searchTerm) {
      filtered = filtered.filter(
        (expense) =>
          expense.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          expense.category?.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (selectedMonth !== "all") {
      filtered = filtered.filter((expense) => {
        const expenseMonth = safeNewDate(expense.date).getMonth() + 1;
        return expenseMonth.toString() === selectedMonth;
      });
    }

    if (selectedYear !== "all") {
      filtered = filtered.filter((expense) => {
        const expenseYear = safeNewDate(expense.date).getFullYear();
        return expenseYear.toString() === selectedYear;
      });
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (expense) => expense.category?.id === selectedCategory
      );
    }

    if (selectedBudgetCategory !== "all") {
      const categoryIdsInBudgetCategory = categories
        .filter((c) => c.budgetCategoryId === selectedBudgetCategory)
        .map((c) => c.id);

      filtered = filtered.filter((expense) =>
        categoryIdsInBudgetCategory.includes(expense.categoryId)
      );
    }

    // Ordenação
    switch (sortBy) {
      case "date-desc":
        filtered.sort(
          (a, b) =>
            safeNewDate(b.date).getTime() - safeNewDate(a.date).getTime()
        );
        break;
      case "date-asc":
        filtered.sort(
          (a, b) =>
            safeNewDate(a.date).getTime() - safeNewDate(b.date).getTime()
        );
        break;
      case "amount-desc":
        filtered.sort((a, b) => b.amount - a.amount);
        break;
      case "amount-asc":
        filtered.sort((a, b) => a.amount - b.amount);
        break;
      case "category":
        filtered.sort((a, b) =>
          (a.category?.name || "").localeCompare(b.category?.name || "")
        );
        break;
    }

    setFilteredExpenses(filtered);
  };

  const deleteExpense = async (id: string) => {
    if (!teamId) return;
    if (!confirm("Tem certeza que deseja excluir este gasto?")) return;

    try {
      await deleteExpenseUseCase.execute({ expenseId: id, teamId: teamId });
      setExpenses(expenses.filter((expense) => expense.id !== id));
      toast({
        title: "Gasto excluído",
        description: "O gasto foi excluído com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir gasto",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedMonth("all");
    setSelectedYear("all");
    setSelectedCategory("all");
    setSelectedBudgetCategory("all");
    setSortBy("date-desc");
  };

  const getBudgetCategoryColor = (budgetCategoryName: string | null) => {
    if (!budgetCategoryName) return "bg-gray-100 text-gray-800";
    return (
      BUDGET_CATEGORY_COLORS[budgetCategoryName] || "bg-gray-100 text-gray-800"
    );
  };

  const formatDate = (dateStr: string) => {
    return safeNewDate(dateStr).toLocaleDateString("pt-BR");
  };

  const getMonths = () => {
    return [
      { value: "1", label: "Janeiro" },
      { value: "2", label: "Fevereiro" },
      { value: "3", label: "Março" },
      { value: "4", label: "Abril" },
      { value: "5", label: "Maio" },
      { value: "6", label: "Junho" },
      { value: "7", label: "Julho" },
      { value: "8", label: "Agosto" },
      { value: "9", label: "Setembro" },
      { value: "10", label: "Outubro" },
      { value: "11", label: "Novembro" },
      { value: "12", label: "Dezembro" },
    ];
  };

  const getYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push({ value: i.toString(), label: i.toString() });
    }
    return years;
  };

  const getTotalAmount = () =>
    filteredExpenses.reduce((total, expense) => total + expense.amount, 0);

  if (authLoading || isLoading || !session || !teamId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Carregando gastos...</h1>
          <Loader2 className="animate-spin h-8 w-8 text-gray-900 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gastos</h1>
              <p className="text-gray-600">
                {filteredExpenses.length} gastos • Total: R${" "}
                {getTotalAmount().toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
          <Button onClick={() => router.push("/expenses/new")}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Gasto
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Busca */}
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="Descrição ou categoria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Mês */}
              <div className="space-y-2">
                <Label>Mês</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os meses</SelectItem>
                    {getMonths().map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ano */}
              <div className="space-y-2">
                <Label>Ano</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os anos</SelectItem>
                    {getYears().map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* NOVO FILTRO: Pasta de Orçamento */}
              <div className="space-y-2">
                <Label>Pasta de Orçamento</Label>
                <Select
                  value={selectedBudgetCategory}
                  onValueChange={setSelectedBudgetCategory}
                >
                  <SelectTrigger>
                    <Folder className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Todas as Pastas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Pastas</SelectItem>
                    {budgetCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name} ({category.percentage * 100}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Categoria (Gasto) */}
              <div className="space-y-2">
                <Label>Categoria (Gasto)</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <Tag className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ordenação */}
              <div className="space-y-2">
                <Label>Ordenar por</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">
                      Data (mais recente)
                    </SelectItem>
                    <SelectItem value="date-asc">Data (mais antigo)</SelectItem>
                    <SelectItem value="amount-desc">Valor (maior)</SelectItem>
                    <SelectItem value="amount-asc">Valor (menor)</SelectItem>
                    <SelectItem value="category">Categoria (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Limpar filtros */}
              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full bg-transparent"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="cards" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="table">Tabela</TabsTrigger>
            <TabsTrigger value="summary">Resumo</TabsTrigger>
          </TabsList>

          {/* Cards View */}
          <TabsContent value="cards" className="space-y-4">
            {filteredExpenses.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Receipt className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {expenses.length === 0
                      ? "Nenhum gasto encontrado"
                      : "Nenhum gasto corresponde aos filtros"}
                  </h3>
                  <p className="text-gray-600 text-center mb-4">
                    {expenses.length === 0
                      ? "Comece adicionando seu primeiro gasto."
                      : "Tente ajustar os filtros."}
                  </p>
                  {expenses.length === 0 && (
                    <Button onClick={() => router.push("/expenses/new")}>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Primeiro Gasto
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExpenses.map((expense) => (
                  <Card
                    key={expense.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          R${" "}
                          {expense.amount.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </CardTitle>
                        <Badge
                          className={getBudgetCategoryColor(
                            expense.category?.budgetCategoryName!
                          )}
                        >
                          {expense.category?.budgetCategoryName || "Sem Pasta"}
                        </Badge>
                      </div>
                      <CardDescription>{expense.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{expense.category?.name}</span>
                        <span>{formatDate(expense.date)}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Adicionado por: {expense.owner?.name}
                      </div>
                      <div className="flex gap-2 pt-2">
                        {expense.receiptUrl && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setSelectedReceipt(expense.receiptUrl!)
                                }
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Nota Fiscal</DialogTitle>
                              </DialogHeader>
                              <div className="flex justify-center">
                                <img
                                  src={expense.receiptUrl || "/placeholder.svg"}
                                  alt="Nota fiscal"
                                  className="max-w-full max-h-96 object-contain"
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/expenses/${expense.id}/edit`)
                          }
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteExpense(expense.id)}
                          className="flex-1"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Table View */}
          <TabsContent value="table" className="space-y-4">
            {filteredExpenses.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  Nenhum gasto encontrado.
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="overflow-x-auto pt-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Data</th>
                        <th className="text-left p-3 font-medium">Valor</th>
                        <th className="text-left p-3 font-medium">Categoria</th>
                        <th className="text-left p-3 font-medium">Descrição</th>
                        <th className="text-left p-3 font-medium">
                          Adicionado por
                        </th>
                        <th className="text-left p-3 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.map((expense) => (
                        <tr
                          key={expense.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="p-3">{formatDate(expense.date)}</td>
                          <td className="p-3 font-medium">
                            R${" "}
                            {expense.amount.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="p-3">
                            <div className="flex flex-col gap-1">
                              <span className="font-medium">
                                {expense.category?.name}
                              </span>
                              <Badge
                                className={`${getBudgetCategoryColor(
                                  expense.category?.budgetCategoryName!
                                )} text-xs w-fit`}
                              >
                                {expense.category?.budgetCategoryName!}
                              </Badge>
                            </div>
                          </td>
                          <td className="p-3 max-w-xs truncate">
                            {expense.description}
                          </td>
                          <td className="p-3">{expense.owner?.name}</td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  router.push(`/expenses/${expense.id}/edit`)
                                }
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteExpense(expense.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Summary View */}
          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {budgetCategories.map((budgetCategory) => {
                const categoryIdsInBudgetCategory = categories
                  .filter((c) => c.budgetCategoryId === budgetCategory.id)
                  .map((c) => c.id);

                const expensesInBudgetCategory = filteredExpenses.filter(
                  (expense) =>
                    categoryIdsInBudgetCategory.includes(expense.categoryId)
                );

                const total = expensesInBudgetCategory.reduce(
                  (sum, expense) => sum + expense.amount,
                  0
                );
                const count = expensesInBudgetCategory.length;

                // if (count === 0) return null; // Não mostra "pastas" sem gastos

                return (
                  <Card key={budgetCategory.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium capitalize">
                        {budgetCategory.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        R${" "}
                        {total.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {count} saídas
                      </p>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Total geral */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Geral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R${" "}
                    {getTotalAmount().toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {filteredExpenses.length} saídas
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gastos por Categoria (de Gasto) */}
            <Card>
              <CardHeader>
                <CardTitle>Gastos por Categoria (Gasto)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map((category) => {
                    const categoryExpenses = filteredExpenses.filter(
                      (expense) => expense.category?.id === category.id
                    );
                    const total = categoryExpenses.reduce(
                      (sum, expense) => sum + expense.amount,
                      0
                    );
                    const percentage =
                      getTotalAmount() > 0
                        ? (total / getTotalAmount()) * 100
                        : 0;

                    if (total === 0) return null;

                    return (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Badge
                            className={getBudgetCategoryColor(
                              category.budgetCategoryName
                            )}
                          >
                            {category.budgetCategoryName}
                          </Badge>
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            R${" "}
                            {total.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </div>
                          <div className="text-sm text-gray-600">
                            {percentage.toFixed(1)}% • {categoryExpenses.length}{" "}
                            gastos
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
