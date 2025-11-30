import { useState, useEffect } from "react";
import { useTeam } from "@/app/(app)/team/team-provider";
import { checkFeatureAccessUseCase } from "@/infrastructure/dependency-injection";

export function useFeatureAccess(featureKey: string) {
  const { currentTeam } = useTeam();
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentTeam) return;

    const check = async () => {
      setIsLoading(true);
      try {
        const access = await checkFeatureAccessUseCase.execute(
          currentTeam.team.id,
          featureKey
        );
        setHasAccess(access);
      } catch (e) {
        console.error(e);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    check();
  }, [currentTeam, featureKey]);

  return { hasAccess, isLoading };
}
