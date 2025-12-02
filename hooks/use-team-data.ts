import { useQuery } from "@tanstack/react-query";
import { getTeamDataUseCase } from "@/infrastructure/dependency-injection";

export function useTeamData(teamId: string | undefined) {
  return useQuery({
    queryKey: ["team-data", teamId],
    queryFn: () => {
      if (!teamId) throw new Error("Team ID is required");
      return getTeamDataUseCase.execute(teamId);
    },
    enabled: !!teamId,
  });
}
