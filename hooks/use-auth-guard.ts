import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useTeam } from "@/app/(app)/team/team-provider";

interface UseAuthGuardOptions {
  /**
   * Redirect path if authentication fails
   * @default "/auth"
   */
  authRedirect?: string;

  /**
   * Redirect path if team is not selected
   * @default "/onboarding"
   */
  teamRedirect?: string;

  /**
   * Whether to require a team to be selected
   * @default true
   */
  requireTeam?: boolean;
}

interface UseAuthGuardReturn {
  /**
   * Authenticated user session
   */
  session: ReturnType<typeof useAuth>["session"];

  /**
   * User ID from session
   */
  userId: string | undefined;

  /**
   * Current team ID
   */
  teamId: string | undefined;

  /**
   * Current team data
   */
  currentTeam: ReturnType<typeof useTeam>["currentTeam"];

  /**
   * Whether authentication is still loading
   */
  isLoading: boolean;

  /**
   * Whether the guard is ready (auth loaded and user is authenticated with team)
   */
  isReady: boolean;
}

/**
 * Custom hook to guard routes requiring authentication and team selection
 *
 * Automatically redirects to:
 * - /auth if user is not authenticated
 * - /onboarding if user doesn't have a team selected
 *
 * @example
 * ```tsx
 * function MyPage() {
 *   const { isReady, session, teamId } = useAuthGuard();
 *
 *   if (!isReady) {
 *     return <LoadingState />;
 *   }
 *
 *   // User is authenticated and has a team
 *   return <div>Protected content</div>;
 * }
 * ```
 */
export function useAuthGuard(
  options: UseAuthGuardOptions = {}
): UseAuthGuardReturn {
  const {
    authRedirect = "/auth",
    teamRedirect = "/onboarding",
    requireTeam = true,
  } = options;

  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const { currentTeam } = useTeam();

  const userId = session?.user?.id;
  const teamId = currentTeam?.team?.id;

  useEffect(() => {
    // Don't redirect while still loading
    if (authLoading) return;

    // Redirect if not authenticated
    if (!session || !userId) {
      router.push(authRedirect);
      return;
    }

    // Redirect if team is required but not selected
    if (requireTeam && !teamId) {
      router.push(teamRedirect);
      return;
    }
  }, [
    session,
    authLoading,
    userId,
    teamId,
    requireTeam,
    router,
    authRedirect,
    teamRedirect,
  ]);

  const isReady =
    !authLoading && !!session && !!userId && (!requireTeam || !!teamId);

  return {
    session,
    userId,
    teamId,
    currentTeam,
    isLoading: authLoading,
    isReady,
  };
}
