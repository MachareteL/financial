import { useQuery } from "@tanstack/react-query";
import { getDashboardDataUseCase } from "@/infrastructure/dependency-injection";

export function useDashboardData(
  teamId: string | undefined,
  month: number,
  year: number
) {
  return useQuery({
    queryKey: ["dashboard", teamId, month, year],
    queryFn: () => {
      if (!teamId) throw new Error("Team ID is required");
      return getDashboardDataUseCase.execute(teamId, month, year);
    },
    enabled: !!teamId,
  });
}
