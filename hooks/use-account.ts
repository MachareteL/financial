import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateProfileUseCase,
  updatePasswordUseCase,
} from "@/infrastructure/dependency-injection";

/**
 * Hook to update user profile information
 *
 * @example
 * ```tsx
 * const updateProfileMutation = useUpdateProfile();
 *
 * const handleSave = async () => {
 *   const updatedSession = await updateProfileMutation.mutateAsync({
 *     userId: user.id,
 *     name: "John Doe"
 *   });
 * };
 * ```
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { userId: string; name: string }) =>
      updateProfileUseCase.execute(params.userId, { name: params.name }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user-profile"],
      });
    },
  });
}

/**
 * Hook to update user password
 *
 * @example
 * ```tsx
 * const updatePasswordMutation = useUpdatePassword();
 *
 * const handleUpdatePassword = async () => {
 *   await updatePasswordMutation.mutateAsync({
 *     newPassword: "newSecurePassword123"
 *   });
 * };
 * ```
 */
export function useUpdatePassword() {
  return useMutation({
    mutationFn: (params: { newPassword: string }) =>
      updatePasswordUseCase.execute(params.newPassword),
  });
}
