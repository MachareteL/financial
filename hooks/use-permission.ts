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
  | "manage_team"
  | "manage_roles"

export function usePermission() {
  const { currentTeam } = useTeam()

  const isOwner = (): boolean => {
    return currentTeam?.role === "Proprietário" || currentTeam?.role === "Owner";
  }

  const isAdmin = (): boolean => {
    return currentTeam?.role === "Administrador" || currentTeam?.role === "Admin";
  }

  const can = (permission: Permission): boolean => {
    if (!currentTeam) return false
    
    if (isOwner() || isAdmin()) return true
    
    return currentTeam.permissions.includes(permission)
  }


  return { can, isOwner, isAdmin }
}