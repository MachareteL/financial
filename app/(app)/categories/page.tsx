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
import {
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Loader2,
  Tag,
  Folder,
} from "lucide-react";
import { useAuth } from "@/app/auth/auth-provider";

import type { CategoryDetailsDTO } from "@/domain/dto/category.types.d.ts";
import type { BudgetCategoryDetailsDTO } from "@/domain/dto/budget-category.types.d.ts";
import {
  getCategoriesUseCase,
  getBudgetCategoriesUseCase,
  createCategoryUseCase,
  updateCategoryUseCase,
  deleteCategoryUseCase,
} from "@/infrastructure/dependency-injection";

import { useTeam } from "../team/team-provider";
import { notify } from "@/lib/notify-helper";

const BUDGET_CATEGORY_COLORS: Record<string, string> = {
  Necessidades: "bg-green-100 text-green-800",
  Desejos: "bg-yellow-100 text-yellow-800",
  Poupança: "bg-blue-100 text-blue-800",
};

export default function CategoriesPage() {
  const { session, loading: authLoading } = useAuth();
  const { currentTeam } = useTeam();
  const teamId = currentTeam?.team.id;
  const userId = session?.user.id;
  const [categories, setCategories] = useState<CategoryDetailsDTO[]>([]);
  const [budgetCategories, setBudgetCategories] = useState<
    BudgetCategoryDetailsDTO[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [editingCategory, setEditingCategory] =
    useState<CategoryDetailsDTO | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

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
      loadData(teamId);
    }
  }, [teamId]);

  const loadData = async (teamId: string) => {
    setIsLoadingData(true);
    try {
      const [categoriesData, budgetCategoriesData] = await Promise.all([
        getCategoriesUseCase.execute(teamId),
        getBudgetCategoriesUseCase.execute(teamId),
      ]);

      setCategories(categoriesData);
      setBudgetCategories(budgetCategoriesData);
    } catch (error: any) {
      notify.error(error, "carregar as categorias.");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!teamId) return;

    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const budgetCategoryId = formData.get("budgetCategoryId") as string;

    try {
      if (editingCategory) {
        await updateCategoryUseCase.execute({
          categoryId: editingCategory.id,
          teamId,
          name,
          budgetCategoryId,
        });
        notify.success("Categoria atualizada", {
          description: `"${name}" foi alterada com sucesso.`,
        });
      } else {
        await createCategoryUseCase.execute({
          name,
          budgetCategoryId,
          teamId,
        });
        notify.success("Categoria criada", {
          description: `"${name}" está pronta para uso.`,
        });
      }

      setIsDialogOpen(false);
      setEditingCategory(null);
      await loadData(teamId);
    } catch (error: any) {
      notify.error(
        error,
        editingCategory ? "atualizar a categoria." : "criar a categoria."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (category: CategoryDetailsDTO) => {
    if (!teamId) return;
    if (!confirm(`Deseja realmente excluir a categoria "${category.name}"?`))
      return;

    setIsLoading(true);
    try {
      await deleteCategoryUseCase.execute({
        categoryId: category.id,
        teamId: teamId,
      });
      notify.success("Categoria excluída com sucesso!");
      await loadData(teamId);
    } catch (error: any) {
      notify.error(error, "excluir a categoria.");
    } finally {
      setIsLoading(false);
    }
  };

  const getBudgetCategoryColor = (budgetCategoryName: string | null) => {
    if (!budgetCategoryName) return "bg-gray-100 text-gray-800";
    return (
      BUDGET_CATEGORY_COLORS[budgetCategoryName] || "bg-gray-100 text-gray-800"
    );
  };

  const openDialog = (category: CategoryDetailsDTO | null) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  if (authLoading || isLoadingData || !session || !teamId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-gray-900 mx-auto" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
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
            <h1 className="text-3xl font-bold text-gray-900">
              Categorias de Gasto
            </h1>
            <p className="text-gray-600">
              Gerencie as categorias para classificar seus gastos.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? "Editar Categoria" : "Nova Categoria"}
                </DialogTitle>
                <DialogDescription>
                  {editingCategory
                    ? "Atualize os dados da categoria"
                    : "Crie uma nova categoria para organizar seus gastos"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Categoria</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ex: Supermercado, Combustível..."
                    defaultValue={editingCategory?.name || ""}
                    required
                  />
                </div>

                {/* 7. Select de "Pastas" (BudgetCategory) */}
                <div className="space-y-2">
                  <Label htmlFor="budgetCategoryId">Pasta de Orçamento</Label>
                  <Select
                    name="budgetCategoryId"
                    defaultValue={
                      editingCategory?.budgetCategoryId ||
                      budgetCategories[0]?.id
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma pasta" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetCategories.map((bc) => (
                        <SelectItem key={bc.id} value={bc.id}>
                          {bc.name} ({(bc.percentage * 100).toFixed(0)}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : editingCategory ? (
                      "Atualizar"
                    ) : (
                      "Criar"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDialog(category)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category)}
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* 8. Badge atualizada para "Pasta" */}
                <Badge
                  className={getBudgetCategoryColor(
                    category.budgetCategoryName
                  )}
                >
                  <Folder className="w-3 h-3 mr-1.5" />
                  {category.budgetCategoryName || "Sem Pasta"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {categories.length === 0 && !isLoadingData && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-500 mb-4">
                Nenhuma categoria encontrada.
              </p>
              <Button onClick={() => openDialog(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Categoria
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Pastas de Orçamento</CardTitle>
            <CardDescription>
              Como organizar suas categorias de gasto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {budgetCategories.map((bc) => (
              <div key={bc.id} className="flex items-center gap-3">
                <Badge className={getBudgetCategoryColor(bc.name)}>
                  {bc.name} ({(bc.percentage * 100).toFixed(0)}%)
                </Badge>
                <span className="text-sm text-gray-600">
                  {categories
                    .filter((c) => c.budgetCategoryId === bc.id)
                    .map((c) => c.name)
                    .join(", ")}
                </span>
              </div>
            ))}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => router.push("/budget")}
            >
              Editar pastas e percentuais
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
