"use client";

import { useTeam } from "@/app/(app)/team/team-provider";
import type { Permission } from "@/domain/types/permission";

export { Permission };

export function usePermission() {
  const { currentTeam } = useTeam();

  const isOwner = (): boolean => {
    return (
      currentTeam?.role === "Proprietário" || currentTeam?.role === "Owner"
    );
  };

  const isAdmin = (): boolean => {
    return (
      currentTeam?.role === "Administrador" || currentTeam?.role === "Admin"
    );
  };

  const can = (permission: Permission): boolean => {
    if (!currentTeam) return false;

    if (isOwner() || isAdmin()) return true;

    return currentTeam.permissions.includes(permission);
  };

  return { can, isOwner, isAdmin };
}
