import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPendingInvitesUseCase,
  acceptInviteUseCase,
  declineInviteUseCase,
} from "@/infrastructure/dependency-injection";

export function usePendingInvites(email: string | undefined | null) {
  return useQuery({
    queryKey: ["invites", email],
    queryFn: () => {
      if (!email) throw new Error("Email is required");
      return getPendingInvitesUseCase.execute(email);
    },
    enabled: !!email,
  });
}

export function useAcceptInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { inviteId: string; userId: string }) =>
      acceptInviteUseCase.execute(params.inviteId, params.userId),
    onSuccess: (_, variables) => {
      // Invalidate invites list
      queryClient.invalidateQueries({
        queryKey: ["invites"],
      });
      // Invalidate user session/teams as the user joined a new team
      queryClient.invalidateQueries({
        queryKey: ["user-session"], // Assuming there's a query for session, or we might need to reload/re-fetch auth
      });
    },
  });
}

export function useDeclineInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteId: string) => declineInviteUseCase.execute(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["invites"],
      });
    },
  });
}
