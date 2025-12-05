import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  getIncomesUseCase,
  createIncomeUseCase,
  updateIncomeUseCase,
  deleteIncomeUseCase,
} from "@/infrastructure/dependency-injection";
import { CreateIncomeDTO, UpdateIncomeDTO } from "@/domain/dto/income.types";

export function useIncomes(teamId: string | undefined) {
  return useQuery({
    queryKey: ["incomes", teamId],
    queryFn: () => {
      if (!teamId) throw new Error("Team ID is required");
      return getIncomesUseCase.execute(teamId);
    },
    enabled: !!teamId,
  });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIncomeDTO) => createIncomeUseCase.execute(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["incomes", variables.teamId],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard", variables.teamId],
      });
    },
  });
}

export function useUpdateIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateIncomeDTO) => updateIncomeUseCase.execute(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["incomes", variables.teamId],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard", variables.teamId],
      });
    },
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      incomeId: string;
      teamId: string;
      userId: string;
    }) => deleteIncomeUseCase.execute(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["incomes", variables.teamId],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard", variables.teamId],
      });
    },
  });
}
