import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  getExpensesUseCase,
  getExpensesSummaryUseCase,
  createExpenseUseCase,
  updateExpenseUseCase,
  deleteExpenseUseCase,
  getExpenseByIdUseCase,
} from "@/infrastructure/dependency-injection";
import { CreateExpenseDTO, UpdateExpenseDTO } from "@/domain/dto/expense.types";

export function useExpenses(params: {
  teamId: string | undefined;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  categoryId?: string;
}) {
  return useQuery({
    queryKey: [
      "expenses",
      params.teamId,
      params.startDate?.toISOString(),
      params.endDate?.toISOString(),
      params.page,
      params.limit,
      params.categoryId,
    ],
    queryFn: () => {
      if (!params.teamId) throw new Error("Team ID is required");
      return getExpensesUseCase.execute({
        teamId: params.teamId,
        startDate: params.startDate,
        endDate: params.endDate,
        page: params.page || 1,
        limit: params.limit || 20,
      });
    },
    enabled: !!params.teamId,
    placeholderData: keepPreviousData,
  });
}

export function useExpensesSummary(params: {
  teamId: string | undefined;
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
}) {
  return useQuery({
    queryKey: [
      "expenses-summary",
      params.teamId,
      params.startDate?.toISOString(),
      params.endDate?.toISOString(),
      params.categoryId,
    ],
    queryFn: () => {
      if (!params.teamId) throw new Error("Team ID is required");
      return getExpensesSummaryUseCase.execute({
        teamId: params.teamId,
        startDate: params.startDate,
        endDate: params.endDate,
        categoryId: params.categoryId,
      });
    },
    enabled: !!params.teamId,
  });
}

export function useExpense(params: {
  expenseId: string | null;
  teamId: string | undefined;
}) {
  return useQuery({
    queryKey: ["expense", params.expenseId, params.teamId],
    queryFn: () => {
      if (!params.expenseId) throw new Error("Expense ID is required");
      if (!params.teamId) throw new Error("Team ID is required");
      return getExpenseByIdUseCase.execute({
        expenseId: params.expenseId,
        teamId: params.teamId,
      });
    },
    enabled: !!params.expenseId && !!params.teamId,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseDTO) => createExpenseUseCase.execute(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["expenses", variables.teamId],
      });
      queryClient.invalidateQueries({
        queryKey: ["expenses-summary", variables.teamId],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard", variables.teamId],
      });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateExpenseDTO) => updateExpenseUseCase.execute(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["expenses", variables.teamId],
      });
      queryClient.invalidateQueries({
        queryKey: ["expenses-summary", variables.teamId],
      });
      queryClient.invalidateQueries({
        queryKey: ["expense", variables.expenseId],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard", variables.teamId],
      });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      expenseId: string;
      teamId: string;
      userId: string;
    }) => deleteExpenseUseCase.execute(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["expenses", variables.teamId],
      });
      queryClient.invalidateQueries({
        queryKey: ["expenses-summary", variables.teamId],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard", variables.teamId],
      });
    },
  });
}
