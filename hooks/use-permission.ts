"use client"

import { useTeam } from "@/app/(app)/team/team-provider"

export type Permission =
  | "view_dashboard"
  | "view_expenses"
  | "create_expenses"
  | "edit_expenses"
  | "delete_expenses"
  | "view_budget"
  | "edit_budget"
  | "view_investments"
  | "edit_investments"
  | "view_categories"
  | "edit_categories"
  | "manage_family"
  | "manage_roles"

export function usePermission() {
  const { currentTeam } = useTeam()

  const can = (permission: Permission): boolean => {
    if (!currentTeam) return false
    return currentTeam.permissions.includes(permission)
  }

  const isAdmin = (): boolean => {
    return currentTeam?.role === "Administrador"
  }

  return { can, isAdmin }
}