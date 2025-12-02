import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategoriesUseCase,
  getBudgetCategoriesUseCase,
  createCategoryUseCase,
  updateCategoryUseCase,
  deleteCategoryUseCase,
} from "@/infrastructure/dependency-injection";
import {
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from "@/domain/dto/category.types";

export function useCategories(teamId: string | undefined) {
  return useQuery({
    queryKey: ["categories", teamId],
    queryFn: () => {
      if (!teamId) throw new Error("Team ID is required");
      return getCategoriesUseCase.execute(teamId);
    },
    enabled: !!teamId,
  });
}

export function useBudgetCategories(teamId: string | undefined) {
  return useQuery({
    queryKey: ["budget-categories", teamId],
    queryFn: () => {
      if (!teamId) throw new Error("Team ID is required");
      return getBudgetCategoriesUseCase.execute(teamId);
    },
    enabled: !!teamId,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryDTO) =>
      createCategoryUseCase.execute(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["categories", variables.teamId],
      });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCategoryDTO) =>
      updateCategoryUseCase.execute(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["categories", variables.teamId],
      });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      categoryId: string;
      teamId: string;
      userId: string;
    }) => deleteCategoryUseCase.execute(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["categories", variables.teamId],
      });
    },
  });
}
