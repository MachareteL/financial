import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getInvestmentsUseCase,
  createInvestmentUseCase,
  updateInvestmentUseCase,
  deleteInvestmentUseCase,
} from "@/infrastructure/dependency-injection";
import {
  CreateInvestmentDTO,
  UpdateInvestmentDTO,
} from "@/domain/dto/investment.types";

export function useInvestments(teamId: string | undefined) {
  return useQuery({
    queryKey: ["investments", teamId],
    queryFn: () => {
      if (!teamId) throw new Error("Team ID is required");
      return getInvestmentsUseCase.execute(teamId);
    },
    enabled: !!teamId,
  });
}

export function useCreateInvestment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvestmentDTO) =>
      createInvestmentUseCase.execute(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["investments", variables.teamId],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard", variables.teamId],
      });
    },
  });
}

export function useUpdateInvestment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateInvestmentDTO) =>
      updateInvestmentUseCase.execute(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["investments", variables.teamId],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard", variables.teamId],
      });
    },
  });
}

export function useDeleteInvestment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      investmentId: string;
      teamId: string;
      userId: string;
    }) => deleteInvestmentUseCase.execute(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["investments", variables.teamId],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard", variables.teamId],
      });
    },
  });
}
