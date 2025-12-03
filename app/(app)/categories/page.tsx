"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useTeam } from "../team/team-provider";
import { usePermission } from "@/hooks/use-permission";
import { notify } from "@/lib/notify-helper";
import {
  useCategories,
  useBudgetCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/use-categories";

// Types
import type { CategoryDetailsDTO } from "@/domain/dto/category.types.d.ts";

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
import { LoadingState } from "@/components/lemon/loading-state";

// --- Visual Configuration ---
const FOLDER_CONFIG: Record<
  string,
  {
    icon: React.ElementType;
    bg: string;
    text: string;
    border: string;
    gradient: string;
  }
> = {
  Necessidades: {
    icon: Home,
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-100 dark:border-blue-800",
    gradient:
      "from-blue-50 to-background dark:from-blue-900/10 dark:to-background",
  },
  Desejos: {
    icon: ShoppingBag,
    bg: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-700 dark:text-purple-400",
    border: "border-purple-100 dark:border-purple-800",
    gradient:
      "from-purple-50 to-background dark:from-purple-900/10 dark:to-background",
  },
  Poupança: {
    icon: PiggyBank,
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-100 dark:border-emerald-800",
    gradient:
      "from-emerald-50 to-background dark:from-emerald-900/10 dark:to-background",
  },
  Investimentos: {
    icon: PiggyBank,
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-100 dark:border-emerald-800",
    gradient:
      "from-emerald-50 to-background dark:from-emerald-900/10 dark:to-background",
  },
  Outros: {
    icon: Wallet,
    bg: "bg-zinc-50 dark:bg-zinc-900/20",
    text: "text-zinc-700 dark:text-zinc-400",
    border: "border-zinc-100 dark:border-zinc-800",
    gradient:
      "from-zinc-50 to-background dark:from-zinc-900/10 dark:to-background",
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
  const { can } = usePermission();
  const router = useRouter();

  const teamId = currentTeam?.team.id;
  const userId = session?.user.id;

  // React Query Hooks
  const { data: categories = [], isLoading: isLoadingCategories } =
    useCategories(teamId);
  const { data: budgetCategories = [], isLoading: isLoadingBudgetCats } =
    useBudgetCategories(teamId);

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const isLoading = isLoadingCategories || isLoadingBudgetCats;
  const isMutating =
    createCategoryMutation.isPending ||
    updateCategoryMutation.isPending ||
    deleteCategoryMutation.isPending;

  // --- State Management ---
  const [searchTerm, setSearchTerm] = useState("");

  // --- Modal State ---
  const [editingCategory, setEditingCategory] =
    useState<CategoryDetailsDTO | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 1. Authentication Check
  useEffect(() => {
    if (authLoading) return;
    if (!session || !userId) router.push("/auth");
    if (!teamId) router.push("/onboarding");
  }, [session, userId, teamId, authLoading, router]);

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

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const budgetCategoryId = formData.get("budgetCategoryId") as string;

    try {
      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({
          categoryId: editingCategory.id,
          teamId,
          userId,
          name,
          budgetCategoryId,
        });
        notify.success("Categoria atualizada!");
      } else {
        await createCategoryMutation.mutateAsync({
          name,
          budgetCategoryId,
          teamId,
          userId,
        });
        notify.success("Categoria criada!");
      }
      setIsDialogOpen(false);
      setEditingCategory(null);
    } catch (error: unknown) {
      notify.error(error, "salvar categoria");
    }
  };

  const handleDelete = async (id: string) => {
    if (!teamId || !userId || !confirm("Excluir esta categoria?")) return;
    try {
      await deleteCategoryMutation.mutateAsync({
        categoryId: id,
        teamId,
        userId,
      });
      notify.success("Categoria excluída.");
    } catch (error: unknown) {
      notify.error(error, "excluir categoria");
    }
  };

  const openDialog = (cat: CategoryDetailsDTO | null) => {
    setEditingCategory(cat);
    setIsDialogOpen(true);
  };

  if (authLoading || isLoading || !session || !teamId) {
    return <LoadingState message="Carregando categorias..." />;
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20 animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
              className="rounded-full hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Categorias
              </h1>
              <p className="text-muted-foreground">
                Organize seus gastos em pastas inteligentes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar categoria..."
                className="pl-9 bg-card border-border rounded-full focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {can("MANAGE_BUDGET") && (
              <Button
                onClick={() => openDialog(null)}
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                <Plus className="w-4 h-4 mr-2" /> Nova
              </Button>
            )}
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
                  <h2 className="text-lg font-bold text-foreground">
                    {folderName}
                  </h2>
                  <Badge
                    variant="secondary"
                    className="bg-muted text-muted-foreground hover:bg-muted/80"
                  >
                    {items.length}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.length === 0 ? (
                    <div className="col-span-full py-8 text-center border-2 border-dashed border-border rounded-2xl bg-muted/30">
                      <p className="text-sm text-muted-foreground">
                        Nenhuma categoria nesta pasta.
                      </p>
                      {can("MANAGE_BUDGET") && (
                        <Button
                          variant="link"
                          onClick={() => openDialog(null)}
                          className="text-primary"
                        >
                          Criar agora
                        </Button>
                      )}
                    </div>
                  ) : (
                    items.map((cat) => (
                      <div
                        key={cat.id}
                        className="group relative bg-card p-4 rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none`}
                        />

                        <div className="relative flex justify-between items-start">
                          <div className="flex items-start gap-3">
                            <div className="mt-1 p-1.5 bg-muted rounded-lg text-muted-foreground group-hover:text-foreground transition-colors">
                              <Tag className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                {cat.name}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {folderName}
                              </p>
                            </div>
                          </div>

                          {can("MANAGE_BUDGET") && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => openDialog(cat)}
                                >
                                  <Edit2 className="w-4 h-4 mr-2" /> Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(cat.id)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}

          {categories.length === 0 && !isLoading && (
            <div className="text-center py-20">
              <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Tudo limpo por aqui
              </h3>
              <p className="text-muted-foreground max-w-xs mx-auto mb-6">
                Comece criando categorias para organizar suas finanças.
              </p>
              {can("MANAGE_BUDGET") && (
                <Button onClick={() => openDialog(null)}>
                  Criar Primeira Categoria
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Dialog Form */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-card border-border shadow-2xl">
            <div
              className={`h-2 w-full bg-gradient-to-r from-primary to-purple-500`}
            />
            <div className="p-6">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  {editingCategory ? (
                    <Edit2 className="w-5 h-5 text-primary" />
                  ) : (
                    <Plus className="w-5 h-5 text-primary" />
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
                    className="text-xs font-bold uppercase text-muted-foreground"
                  >
                    Nome
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ex: Mercado, Uber, Netflix..."
                    defaultValue={editingCategory?.name || ""}
                    required
                    className="bg-muted/50 border-border focus:bg-background transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="budgetCategoryId"
                    className="text-xs font-bold uppercase text-muted-foreground"
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
                    <SelectTrigger className="bg-muted/50 border-border">
                      <SelectValue placeholder="Selecione uma pasta" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetCategories.map((bc) => (
                        <SelectItem key={bc.id} value={bc.id}>
                          <div className="flex items-center gap-2">
                            <Folder className="w-4 h-4 text-muted-foreground" />
                            <span>{bc.name}</span>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {(bc.percentage * 100).toFixed(0)}%
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground">
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
                    disabled={isMutating}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isMutating ? (
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
