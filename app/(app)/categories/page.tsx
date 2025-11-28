"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth/auth-provider";
import { useTeam } from "../team/team-provider";
import { notify } from "@/lib/notify-helper";

// Use Cases
import {
  getCategoriesUseCase,
  getBudgetCategoriesUseCase,
  createCategoryUseCase,
  updateCategoryUseCase,
  deleteCategoryUseCase,
} from "@/infrastructure/dependency-injection";

// Types
import type { CategoryDetailsDTO } from "@/domain/dto/category.types.d.ts";
import type { BudgetCategoryDetailsDTO } from "@/domain/dto/budget-category.types.d.ts";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Loader2,
  Folder,
  MoreHorizontal,
  Search,
  Tag,
  ShoppingBag,
  Home,
  PiggyBank,
  Wallet,
  Sparkles,
} from "lucide-react";

// --- Visual Configuration ---
const FOLDER_CONFIG: Record<
  string,
  {
    icon: any;
    bg: string;
    text: string;
    border: string;
    gradient: string;
  }
> = {
  Necessidades: {
    icon: Home,
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-100",
    gradient: "from-blue-50 to-white",
  },
  Desejos: {
    icon: ShoppingBag,
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-100",
    gradient: "from-purple-50 to-white",
  },
  Poupança: {
    icon: PiggyBank,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-100",
    gradient: "from-emerald-50 to-white",
  },
  Investimentos: {
    icon: PiggyBank,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-100",
    gradient: "from-emerald-50 to-white",
  },
  Outros: {
    icon: Wallet,
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-100",
    gradient: "from-slate-50 to-white",
  },
};

const getFolderStyle = (name: string | null) => {
  const key =
    Object.keys(FOLDER_CONFIG).find((k) => name?.includes(k)) || "Outros";
  return FOLDER_CONFIG[key];
};

export default function CategoriesPage() {
  const { session, loading: authLoading } = useAuth();
  const { currentTeam } = useTeam();
  const router = useRouter();

  // --- State Management ---
  const [categories, setCategories] = useState<CategoryDetailsDTO[]>([]);
  const [budgetCategories, setBudgetCategories] = useState<
    BudgetCategoryDetailsDTO[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Modal State ---
  const [editingCategory, setEditingCategory] =
    useState<CategoryDetailsDTO | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const teamId = currentTeam?.team.id;
  const userId = session?.user.id;

  // 1. Authentication Check
  useEffect(() => {
    if (authLoading) return;
    if (!session || !userId) router.push("/auth");
    if (!teamId) router.push("/onboarding");
  }, [session, userId, teamId, authLoading, router]);

  // 2. Data Loading
  useEffect(() => {
    if (teamId) loadData();
  }, [teamId]);

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      const [cats, budCats] = await Promise.all([
        getCategoriesUseCase.execute(teamId!),
        getBudgetCategoriesUseCase.execute(teamId!),
      ]);
      setCategories(cats);
      setBudgetCategories(budCats);
    } catch (error: any) {
      notify.error(error, "carregar dados");
    } finally {
      setIsLoadingData(false);
    }
  };

  // 3. Category Grouping
  const groupedCategories = useMemo(() => {
    const groups: Record<string, CategoryDetailsDTO[]> = {};

    // Initialize groups based on existing folders
    budgetCategories.forEach((bc) => {
      groups[bc.name] = [];
    });

    // Distribute categories into groups
    categories.forEach((cat) => {
      if (
        searchTerm &&
        !cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return;

      const groupName = cat.budgetCategoryName || "Outros";
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(cat);
    });

    // Filter empty groups if searching, otherwise keep structure
    return groups;
  }, [categories, budgetCategories, searchTerm]);

  // 4. Event Handlers
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!teamId || !userId) return;
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const budgetCategoryId = formData.get("budgetCategoryId") as string;

    try {
      if (editingCategory) {
        await updateCategoryUseCase.execute({
          categoryId: editingCategory.id,
          teamId,
          userId,
          name,
          budgetCategoryId,
        });
        notify.success("Categoria atualizada!");
      } else {
        await createCategoryUseCase.execute({
          name,
          budgetCategoryId,
          teamId,
          userId,
        });
        notify.success("Categoria criada!");
      }
      setIsDialogOpen(false);
      setEditingCategory(null);
      await loadData();
    } catch (error: any) {
      notify.error(error, "salvar categoria");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!teamId || !userId || !confirm("Excluir esta categoria?")) return;
    setIsLoading(true);
    try {
      await deleteCategoryUseCase.execute({ categoryId: id, teamId, userId });
      notify.success("Categoria excluída.");
      await loadData();
    } catch (error: any) {
      notify.error(error, "excluir categoria");
    } finally {
      setIsLoading(false);
    }
  };

  const openDialog = (cat: CategoryDetailsDTO | null) => {
    setEditingCategory(cat);
    setIsDialogOpen(true);
  };

  if (authLoading || isLoadingData || !session || !teamId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-8 w-8 text-slate-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 pb-20 animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
              className="rounded-full hover:bg-slate-100"
            >
              <ArrowLeft className="h-5 w-5 text-slate-500" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Categorias
              </h1>
              <p className="text-slate-500">
                Organize seus gastos em pastas inteligentes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar categoria..."
                className="pl-9 bg-white border-slate-200 rounded-full focus:ring-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              onClick={() => openDialog(null)}
              className="rounded-full bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-200"
            >
              <Plus className="w-4 h-4 mr-2" /> Nova
            </Button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="space-y-8">
          {Object.entries(groupedCategories).map(([folderName, items]) => {
            if (items.length === 0 && searchTerm) return null; // Esconde vazios na busca

            const style = getFolderStyle(folderName);
            const Icon = style.icon;

            return (
              <div
                key={folderName}
                className="space-y-4 animate-in slide-in-from-bottom-4 duration-500"
              >
                <div className="flex items-center gap-3 px-2">
                  <div
                    className={`p-2 rounded-xl ${style.bg} ${style.text} shadow-sm`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">
                    {folderName}
                  </h2>
                  <Badge
                    variant="secondary"
                    className="bg-slate-100 text-slate-500 hover:bg-slate-200"
                  >
                    {items.length}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.length === 0 ? (
                    <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                      <p className="text-sm text-slate-400">
                        Nenhuma categoria nesta pasta.
                      </p>
                      <Button
                        variant="link"
                        onClick={() => openDialog(null)}
                        className="text-slate-600"
                      >
                        Criar agora
                      </Button>
                    </div>
                  ) : (
                    items.map((cat) => (
                      <div
                        key={cat.id}
                        className="group relative bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300"
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none`}
                        />

                        <div className="relative flex justify-between items-start">
                          <div className="flex items-start gap-3">
                            <div className="mt-1 p-1.5 bg-slate-50 rounded-lg text-slate-400 group-hover:text-slate-600 transition-colors">
                              <Tag className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
                                {cat.name}
                              </h3>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {folderName}
                              </p>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 -mr-2 text-slate-300 hover:text-slate-600"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openDialog(cat)}>
                                <Edit2 className="w-4 h-4 mr-2" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(cat.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}

          {categories.length === 0 && !isLoadingData && (
            <div className="text-center py-20">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Tudo limpo por aqui
              </h3>
              <p className="text-slate-500 max-w-xs mx-auto mb-6">
                Comece criando categorias para organizar suas finanças.
              </p>
              <Button onClick={() => openDialog(null)}>
                Criar Primeira Categoria
              </Button>
            </div>
          )}
        </div>

        {/* Dialog Form */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-white border-none shadow-2xl">
            <div
              className={`h-2 w-full bg-gradient-to-r from-blue-500 to-purple-500`}
            />
            <div className="p-6">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  {editingCategory ? (
                    <Edit2 className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Plus className="w-5 h-5 text-blue-500" />
                  )}
                  {editingCategory ? "Editar Categoria" : "Nova Categoria"}
                </DialogTitle>
                <DialogDescription>
                  Categorias ajudam a entender para onde seu dinheiro vai.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-xs font-bold uppercase text-slate-500"
                  >
                    Nome
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ex: Mercado, Uber, Netflix..."
                    defaultValue={editingCategory?.name || ""}
                    required
                    className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="budgetCategoryId"
                    className="text-xs font-bold uppercase text-slate-500"
                  >
                    Pasta de Orçamento
                  </Label>
                  <Select
                    name="budgetCategoryId"
                    defaultValue={
                      editingCategory?.budgetCategoryId ||
                      budgetCategories[0]?.id
                    }
                    required
                  >
                    <SelectTrigger className="bg-slate-50 border-slate-200">
                      <SelectValue placeholder="Selecione uma pasta" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetCategories.map((bc) => (
                        <SelectItem key={bc.id} value={bc.id}>
                          <div className="flex items-center gap-2">
                            <Folder className="w-4 h-4 text-slate-400" />
                            <span>{bc.name}</span>
                            <span className="text-xs text-slate-400 ml-auto">
                              {(bc.percentage * 100).toFixed(0)}%
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-slate-400">
                    Isso define em qual pote do orçamento essa categoria vai
                    consumir.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-slate-900 hover:bg-slate-800"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin w-4 h-4" />
                    ) : (
                      "Salvar"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
