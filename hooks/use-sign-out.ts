import { useMutation } from "@tanstack/react-query";
import { signOutUseCase } from "@/infrastructure/dependency-injection";

/**
 * Hook to handle user sign out
 *
 * @example
 * ```tsx
 * const signOutMutation = useSignOut();
 *
 * const handleLogout = async () => {
 *   await signOutMutation.mutateAsync();
 *   router.push("/auth");
 * };
 * ```
 */
export function useSignOut() {
  return useMutation({
    mutationFn: () => signOutUseCase.execute(),
  });
}
