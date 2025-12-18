import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createTeamUseCase,
  updateTeamUseCase,
} from "@/infrastructure/dependency-injection";

/**
 * Hook to create a new team
 *
 * @example
 * ```tsx
 * const createTeamMutation = useCreateTeam();
 *
 * const handleCreateTeam = async () => {
 *   const team = await createTeamMutation.mutateAsync({
 *     name: "My Team",
 *     ownerId: userId
 *   });
 * };
 * ```
 */
export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { name: string; ownerId: string }) =>
      createTeamUseCase.execute({
        teamName: params.name,
        userId: params.ownerId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["teams"],
      });
    },
  });
}

/**
 * Hook to update team information
 *
 * @example
 * ```tsx
 * const updateTeamMutation = useUpdateTeam();
 *
 * const handleUpdateTeam = async () => {
 *   await updateTeamMutation.mutateAsync({
 *     teamId: "123",
 *     name: "Updated Name",
 *     userId: userId
 *   });
 * };
 * ```
 */
export function useUpdateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { teamId: string; name: string; userId: string }) =>
      updateTeamUseCase.execute(params.teamId, params.name, params.userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["teams"],
      });
      queryClient.invalidateQueries({
        queryKey: ["team-data"],
      });
    },
  });
}
