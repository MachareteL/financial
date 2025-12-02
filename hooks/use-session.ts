import { useQuery } from "@tanstack/react-query";
import { getCurrentAuthUserUseCase } from "@/infrastructure/dependency-injection";

export function useSession() {
  return useQuery({
    queryKey: ["user-session"],
    queryFn: () => getCurrentAuthUserUseCase.execute(),
    // Stale time infinite because session doesn't change often without user action
    staleTime: Infinity,
    retry: false,
  });
}
