import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBudgetUseCase,
  saveBudgetUseCase,
  getBudgetCategoriesUseCase,
  createBudgetCategoryUseCase,
  updateBudgetCategoryUseCase,
  deleteBudgetCategoryUseCase,
} from "@/infrastructure/dependency-injection";
import {
  CreateBudgetCategoryDTO,
  UpdateBudgetCategoryDTO,
} from "@/domain/dto/budget-category.types";

export function useBudget(
  teamId: string | undefined,
  month: number,
  year: number
) {
  return useQuery({
    queryKey: ["budget", teamId, month, year],
    queryFn: () => {
      if (!teamId) throw new Error("Team ID is required");
      return getBudgetUseCase.execute({ teamId, month, year });
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

export function useSaveBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      teamId: string;
      userId: string;
      month: number;
      year: number;
      totalIncome: number;
    }) => saveBudgetUseCase.execute(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["budget", variables.teamId],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard", variables.teamId],
      });
    },
  });
}

export function useCreateBudgetCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBudgetCategoryDTO) =>
      createBudgetCategoryUseCase.execute(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["budget-categories", variables.teamId],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard", variables.teamId],
      });
    },
  });
}

export function useUpdateBudgetCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBudgetCategoryDTO) =>
      updateBudgetCategoryUseCase.execute(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["budget-categories", variables.teamId],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard", variables.teamId],
      });
    },
  });
}

export function useDeleteBudgetCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      budgetCategoryId: string;
      teamId: string;
      userId: string;
    }) => deleteBudgetCategoryUseCase.execute(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["budget-categories", variables.teamId],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard", variables.teamId],
      });
    },
  });
}
