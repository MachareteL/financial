"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit, Trash2, Plus, Loader2, Shield, Crown } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useTeam } from "@/app/(app)/team/team-provider";
import { usePermission } from "@/hooks/use-permission";
import { notify } from "@/lib/notify-helper";
import { manageRolesUseCase } from "@/infrastructure/dependency-injection";
import type { TeamRole } from "@/domain/entities/team-role";

interface TeamRolesTabProps {
  roles: TeamRole[];
  onUpdate: () => Promise<void>;
}

const AVAILABLE_PERMISSIONS = [
  { key: "MANAGE_EXPENSES", label: "Gerenciar Gastos" },
  { key: "MANAGE_BUDGET", label: "Gerenciar Orçamento e Categorias" },
  { key: "MANAGE_INVESTMENTS", label: "Gerenciar Investimentos" },
  { key: "MANAGE_TEAM", label: "Gerenciar Equipe e Cargos" },
];

const ROLE_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#84cc16",
];

export function TeamRolesTab({ roles, onUpdate }: TeamRolesTabProps) {
  const { currentTeam } = useTeam();
  const { session } = useAuth();
  const { can } = usePermission();

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [editingRole, setEditingRole] = useState<TeamRole | null>(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleColor, setNewRoleColor] = useState(ROLE_COLORS[0]);
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);

  const isProtectedRole = (roleName?: string) => {
    return (
      roleName === "Proprietário" ||
      roleName === "Owner" ||
      roleName === "Administrador"
    );
  };

  const openRoleModal = (role?: TeamRole) => {
    if (role) {
      setEditingRole(role);
      setNewRoleName(role.name);
      setNewRoleColor(role.color);
      setNewRolePermissions(role.permissions);
    } else {
      setEditingRole(null);
      setNewRoleName("");
      setNewRoleColor(ROLE_COLORS[0]);
      setNewRolePermissions([]);
    }
    setIsRoleModalOpen(true);
  };

  const togglePermission = (p: string) => {
    setNewRolePermissions((prev) =>
      prev.includes(p) ? prev.filter((i) => i !== p) : [...prev, p]
    );
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam || !session?.user) return;

    setIsActionLoading(true);
    try {
      if (editingRole) {
        await manageRolesUseCase.updateRole({
          roleId: editingRole.id,
          teamId: currentTeam.team.id,
          userId: session.user.id,
          name: newRoleName,
          color: newRoleColor,
          permissions: newRolePermissions,
        });
        notify.success("Cargo atualizado!");
      } else {
        await manageRolesUseCase.createRole({
          teamId: currentTeam.team.id,
          userId: session.user.id,
          name: newRoleName,
          color: newRoleColor,
          permissions: newRolePermissions,
        });
        notify.success("Cargo criado!");
      }
      setIsRoleModalOpen(false);
      await onUpdate();
    } catch (error: unknown) {
      notify.error(error, "salvar o cargo");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!currentTeam || !session?.user) return;
    if (!confirm("Excluir este cargo? Membros perderão suas permissões."))
      return;
    setIsActionLoading(true);
    try {
      await manageRolesUseCase.deleteRole(
        roleId,
        currentTeam.team.id,
        session.user.id
      );
      notify.success("Cargo excluído!");
      await onUpdate();
    } catch (error: unknown) {
      notify.error(error, "excluir o cargo");
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Cargos e Permissões
          </h3>
          <p className="text-sm text-muted-foreground">
            Defina o que cada membro pode fazer na equipe.
          </p>
        </div>
        {can("MANAGE_TEAM") && (
          <Button
            onClick={() => openRoleModal()}
            className="w-full sm:w-auto shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Cargo
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => {
          const roleIsOwner = isProtectedRole(role.name);
          return (
            <Card
              key={role.id}
              className={`transition-all hover:shadow-md ${
                roleIsOwner ? "border-secondary/20 bg-secondary/5" : "bg-card"
              }`}
            >
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full shadow-sm ring-1 ring-black/5"
                    style={{ backgroundColor: role.color }}
                  />
                  <CardTitle className="text-base flex items-center gap-2">
                    {role.name}
                    {roleIsOwner && (
                      <Crown className="w-3 h-3 text-secondary-foreground fill-secondary-foreground" />
                    )}
                  </CardTitle>
                </div>
                {can("MANAGE_TEAM") && !roleIsOwner && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-muted"
                      onClick={() => openRoleModal(role)}
                    >
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-red-50"
                      onClick={() => handleDeleteRole(role.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                )}
                {roleIsOwner && (
                  <Badge
                    variant="outline"
                    className="bg-secondary text-secondary-foreground border-secondary/20 text-[10px]"
                  >
                    Sistema
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {roleIsOwner ? (
                    <span className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                      <Shield className="w-3 h-3" /> Acesso total a todas as
                      funcionalidades
                    </span>
                  ) : (
                    <>
                      {role.permissions.length === 0 && (
                        <span className="text-sm text-muted-foreground italic">
                          Nenhuma permissão definida
                        </span>
                      )}
                      {role.permissions.slice(0, 8).map((p) => (
                        <Badge
                          key={p}
                          variant="secondary"
                          className="text-[10px] font-normal text-muted-foreground bg-muted hover:bg-muted/80 border"
                        >
                          {AVAILABLE_PERMISSIONS.find((ap) => ap.key === p)
                            ?.label || p}
                        </Badge>
                      ))}
                      {role.permissions.length > 8 && (
                        <Badge variant="secondary" className="text-[10px]">
                          +{role.permissions.length - 8}
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? "Editar Cargo" : "Novo Cargo"}
            </DialogTitle>
            <DialogDescription>
              {editingRole
                ? "Edite as permissões e detalhes deste cargo."
                : "Crie um novo cargo e defina suas permissões."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveRole} className="space-y-6 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>Nome do Cargo</Label>
                <Input
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  required
                  placeholder="Ex: Gerente Financeiro"
                />
              </div>
              <div className="space-y-3">
                <Label>Cor de Identificação</Label>
                <div className="flex gap-2 flex-wrap p-1">
                  {ROLE_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-6 h-6 rounded-full transition-all hover:scale-110 ${
                        newRoleColor === color
                          ? "ring-2 ring-offset-2 ring-black scale-110"
                          : ""
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewRoleColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <Label>Permissões de Acesso</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto border p-4 rounded-lg bg-muted/30">
                {AVAILABLE_PERMISSIONS.map((perm) => (
                  <div
                    key={perm.key}
                    className="flex items-center space-x-3 bg-card p-2.5 rounded-md border shadow-sm transition-colors hover:border-primary/50"
                  >
                    <Checkbox
                      id={`role-${perm.key}`}
                      checked={newRolePermissions.includes(perm.key)}
                      onCheckedChange={() => togglePermission(perm.key)}
                    />
                    <Label
                      htmlFor={`role-${perm.key}`}
                      className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {perm.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isActionLoading}>
              {isActionLoading ? (
                <Loader2 className="animate-spin mr-2" />
              ) : editingRole ? (
                "Salvar Alterações"
              ) : (
                "Criar Cargo"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
