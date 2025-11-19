"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  UserPlus,
  Mail,
  Edit,
  Trash2,
  Plus,
  Loader2,
  X,
  Shield,
  Crown,
} from "lucide-react";
import { useAuth } from "@/app/auth/auth-provider";
import { useTeam } from "@/app/(app)/team/team-provider";
import { usePermission } from "@/hooks/use-permission";

import { notify } from "@/lib/notify-helper";

// DTOs e Entidades
import type { TeamMemberProfileDTO } from "@/domain/dto/team.types.d.ts";
import type { TeamRole } from "@/domain/entities/team-role";
import type { TeamInvite } from "@/domain/entities/team-invite";

// Casos de Uso
import {
  getTeamDataUseCase,
  manageRolesUseCase,
  manageMembersUseCase,
} from "@/infrastructure/dependency-injection";

const AVAILABLE_PERMISSIONS = [
  { key: "view_dashboard", label: "Ver Dashboard" },
  { key: "view_expenses", label: "Ver Gastos" },
  { key: "create_expenses", label: "Criar Gastos" },
  { key: "edit_expenses", label: "Editar Gastos" },
  { key: "delete_expenses", label: "Excluir Gastos" },
  { key: "view_budget", label: "Ver Orçamento" },
  { key: "edit_budget", label: "Editar Orçamento" },
  { key: "view_investments", label: "Ver Investimentos" },
  { key: "edit_investments", label: "Editar Investimentos" },
  { key: "view_categories", label: "Ver Categorias" },
  { key: "edit_categories", label: "Editar Categorias" },
  { key: "manage_team", label: "Gerenciar Equipe (Membros)" },
  { key: "manage_roles", label: "Gerenciar Cargos" },
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

export default function TeamPage() {
  const { session } = useAuth();
  const { currentTeam } = useTeam();
  const { can } = usePermission();
  const router = useRouter();

  // Dados
  const [members, setMembers] = useState<TeamMemberProfileDTO[]>([]);
  const [roles, setRoles] = useState<TeamRole[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);

  // Estados de UI
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Modais
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Formulários
  const [editingRole, setEditingRole] = useState<TeamRole | null>(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleColor, setNewRoleColor] = useState(ROLE_COLORS[0]);
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoleId, setInviteRoleId] = useState<string>("");

  // Carregar dados ao entrar ou trocar de time
  useEffect(() => {
    if (currentTeam) loadTeamData();
  }, [currentTeam]);

  const loadTeamData = async () => {
    if (!currentTeam) return;
    setIsLoading(true);
    try {
      const data = await getTeamDataUseCase.execute(currentTeam.team.id);
      setMembers(data.members);
      setRoles(data.roles);
      setInvites(data.invites);
    } catch (error: any) {
      notify.error(error, "carregar os dados da equipe");
    } finally {
      setIsLoading(false);
    }
  };

  // --- HELPERS ---

  // Verifica se o cargo é protegido (Proprietário)
  // Isso impede edição/exclusão visualmente
  const isProtectedRole = (roleName?: string) => {
    return (
      roleName === "Proprietário" ||
      roleName === "Owner" ||
      roleName === "Administrador"
    );
  };

  // Abre o modal de cargo (para criar OU editar)
  const openRoleModal = (role?: TeamRole) => {
    if (role) {
      // Modo Edição
      setEditingRole(role);
      setNewRoleName(role.name);
      setNewRoleColor(role.color);
      setNewRolePermissions(role.permissions);
    } else {
      // Modo Criação (Reset)
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

  // --- AÇÕES DE MEMBROS ---

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam || !session?.user) return;

    setIsActionLoading(true);
    try {
      await manageMembersUseCase.inviteMember({
        teamId: currentTeam.team.id,
        email: inviteEmail,
        roleId: inviteRoleId === "default" ? null : inviteRoleId,
        invitedBy: session.user.id,
      });

      notify.success("Convite enviado!", {
        description: `Um email foi enviado para ${inviteEmail}.`,
      });

      setInviteEmail("");
      setInviteRoleId("");
      setIsInviteOpen(false);
      await loadTeamData();
    } catch (error: any) {
      notify.error(error, "enviar o convite");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdateMemberRole = async (memberId: string, roleId: string) => {
    if (!currentTeam) return;
    try {
      await manageMembersUseCase.updateMemberRole({
        teamId: currentTeam.team.id,
        memberId,
        roleId: roleId === "default" ? null : roleId,
      });
      notify.success("Cargo atualizado com sucesso!");
      await loadTeamData();
    } catch (error: any) {
      notify.error(error, "atualizar o cargo");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!currentTeam) return;
    if (!confirm("Remover este membro da equipe? Ele perderá acesso a equipe."))
      return;

    setIsActionLoading(true);
    try {
      await manageMembersUseCase.removeMember(currentTeam.team.id, memberId);
      notify.success("Membro removido", {
        description: "A lista de acesso foi atualizada.",
      });
      await loadTeamData();
    } catch (error: any) {
      notify.error(error, "remover o membro");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    if (!currentTeam) return;
    try {
      await manageMembersUseCase.cancelInvite(inviteId, currentTeam.team.id);
      notify.success("Convite cancelado");
      await loadTeamData();
    } catch (error: any) {
      notify.error(error, "cancelar o convite");
    }
  };

  // --- AÇÕES DE CARGOS ---

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam) return;

    setIsActionLoading(true);
    try {
      if (editingRole) {
        await manageRolesUseCase.updateRole({
          roleId: editingRole.id,
          teamId: currentTeam.team.id,
          name: newRoleName,
          color: newRoleColor,
          permissions: newRolePermissions,
        });
        notify.success("Cargo atualizado!");
      } else {
        await manageRolesUseCase.createRole({
          teamId: currentTeam.team.id,
          name: newRoleName,
          color: newRoleColor,
          permissions: newRolePermissions,
        });
        notify.success("Cargo criado!");
      }
      setIsRoleModalOpen(false);
      await loadTeamData();
    } catch (error: any) {
      notify.error(error, "salvar o cargo");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!currentTeam) return;
    if (!confirm("Excluir este cargo? Membros perderão suas permissões."))
      return;
    setIsActionLoading(true);
    try {
      await manageRolesUseCase.deleteRole(roleId, currentTeam.team.id);
      notify.success("Cargo excluído!");
      await loadTeamData();
    } catch (error: any) {
      notify.error(error, "excluir o cargo");
    } finally {
      setIsActionLoading(false);
    }
  };

  if (!currentTeam || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-gray-900 mx-auto" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Equipe: {currentTeam.team.name}
            </h1>
            <p className="text-gray-600">
              Gerencie membros, cargos e permissões.
            </p>
          </div>
        </div>

        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="members">Membros</TabsTrigger>
            <TabsTrigger value="roles">Cargos</TabsTrigger>
            <TabsTrigger value="invites">Convites</TabsTrigger>
          </TabsList>

          {/* ABA 1: MEMBROS */}
          <TabsContent value="members" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Membros Ativos
              </h3>
              {can("manage_team") && (
                <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="w-4 h-4 mr-2" /> Convidar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Convidar Membro</DialogTitle>
                      <DialogDescription>
                        Envie um convite por email.
                      </DialogDescription>
                    </DialogHeader>
                    <form
                      onSubmit={handleInviteMember}
                      className="space-y-4 mt-2"
                    >
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          required
                          placeholder="exemplo@email.com"
                        />
                      </div>
                      <div>
                        <Label>Cargo Inicial</Label>
                        <Select
                          value={inviteRoleId}
                          onValueChange={setInviteRoleId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">
                              Sem cargo (Acesso limitado)
                            </SelectItem>
                            {/* Filtra o cargo de Proprietário para não ser atribuído a outros */}
                            {roles
                              .filter((r) => !isProtectedRole(r.name))
                              .map((r) => (
                                <SelectItem key={r.id} value={r.id}>
                                  {r.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isActionLoading}
                      >
                        {isActionLoading ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          "Enviar Convite"
                        )}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => {
                const memberIsOwner = isProtectedRole(member.teamRole?.name);
                const isMe = member.id === session?.user?.id;

                return (
                  <Card
                    key={member.id}
                    className={`overflow-hidden transition-all hover:shadow-md ${
                      memberIsOwner ? "border-yellow-200 bg-yellow-50/30" : ""
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                              memberIsOwner
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            {member.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">
                                {member.name}
                              </p>
                              {memberIsOwner && (
                                <Crown className="w-3 h-3 text-yellow-600 fill-yellow-600" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate max-w-[140px]">
                              {member.email}
                            </p>
                          </div>
                        </div>
                        {isMe && <Badge variant="secondary">Você</Badge>}
                      </div>

                      <div className="space-y-3 pt-2 border-t">
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs text-gray-500">Cargo</Label>

                          {/* Lógica de exibição/edição de cargo */}
                          {memberIsOwner ? (
                            <div className="flex items-center gap-2 text-sm font-semibold text-yellow-800 bg-yellow-100 p-2 rounded border border-yellow-200">
                              <Shield className="w-3 h-3" />
                              {member.teamRole?.name}
                            </div>
                          ) : can("manage_roles") && !isMe ? (
                            <Select
                              value={member.roleId || "default"}
                              onValueChange={(val) =>
                                handleUpdateMemberRole(member.id, val)
                              }
                            >
                              <SelectTrigger className="h-9 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="default">
                                  Sem cargo
                                </SelectItem>
                                {roles
                                  .filter((r) => !isProtectedRole(r.name))
                                  .map((r) => (
                                    <SelectItem key={r.id} value={r.id}>
                                      {r.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="text-sm font-medium bg-gray-50 p-2 rounded border">
                              {member.teamRole
                                ? member.teamRole.name
                                : "Sem cargo"}
                            </div>
                          )}
                        </div>

                        {/* Botão Remover: Só se não for Proprietário e eu tiver permissão */}
                        {can("manage_team") && !isMe && !memberIsOwner && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 h-8"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <Trash2 className="w-3 h-3 mr-2" /> Remover da
                            equipe
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ABA 2: CARGOS */}
          <TabsContent value="roles" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Cargos Personalizados
              </h3>
              {can("manage_roles") && (
                <Button onClick={() => openRoleModal()} variant="outline">
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
                    className={
                      roleIsOwner ? "border-yellow-200 bg-yellow-50/20" : ""
                    }
                  >
                    <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full shadow-sm"
                          style={{ backgroundColor: role.color }}
                        />
                        <CardTitle className="text-base flex items-center gap-2">
                          {role.name}
                          {roleIsOwner && (
                            <Crown className="w-3 h-3 text-yellow-600" />
                          )}
                        </CardTitle>
                      </div>
                      {/* Botões de editar/excluir somem para o Proprietário */}
                      {can("manage_roles") && !roleIsOwner && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openRoleModal(role)}
                          >
                            <Edit className="w-4 h-4 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDeleteRole(role.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                      {roleIsOwner && (
                        <Badge
                          variant="outline"
                          className="bg-yellow-100 text-yellow-800 border-yellow-200"
                        >
                          Sistema
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1.5">
                        {roleIsOwner ? (
                          <span className="text-xs text-gray-500 italic flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Acesso total a todas
                            as funcionalidades
                          </span>
                        ) : (
                          <>
                            {role.permissions.length === 0 && (
                              <span className="text-sm text-gray-400 italic">
                                Nenhuma permissão
                              </span>
                            )}
                            {role.permissions.slice(0, 8).map((p) => (
                              <Badge
                                key={p}
                                variant="secondary"
                                className="text-[10px] font-normal text-gray-600 bg-gray-100 hover:bg-gray-200 border"
                              >
                                {AVAILABLE_PERMISSIONS.find(
                                  (ap) => ap.key === p
                                )?.label || p}
                              </Badge>
                            ))}
                            {role.permissions.length > 8 && (
                              <Badge
                                variant="secondary"
                                className="text-[10px]"
                              >
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

            {/* Modal de Criar/Editar Cargo (Unificado) */}
            <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingRole ? "Editar Cargo" : "Novo Cargo"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingRole
                      ? "Edite as permissões deste cargo."
                      : "Defina as permissões do novo cargo."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSaveRole} className="space-y-4 mt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cor</Label>
                      <div className="flex gap-2 flex-wrap">
                        {ROLE_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className={`w-6 h-6 rounded-full ${
                              newRoleColor === color
                                ? "ring-2 ring-offset-2 ring-black"
                                : ""
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setNewRoleColor(color)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Permissões</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border p-3 rounded-lg bg-gray-50">
                      {AVAILABLE_PERMISSIONS.map((perm) => (
                        <div
                          key={perm.key}
                          className="flex items-center space-x-2 bg-white p-2 rounded border shadow-sm"
                        >
                          <Checkbox
                            id={`role-${perm.key}`}
                            checked={newRolePermissions.includes(perm.key)}
                            onCheckedChange={() => togglePermission(perm.key)}
                          />
                          <Label
                            htmlFor={`role-${perm.key}`}
                            className="cursor-pointer text-sm"
                          >
                            {perm.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isActionLoading}
                  >
                    {isActionLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : editingRole ? (
                      "Salvar Alterações"
                    ) : (
                      "Criar Cargo"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* ABA 3: CONVITES */}
          <TabsContent value="invites" className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Convites Pendentes
            </h3>
            {invites.length === 0 ? (
              <Card className="border-dashed bg-gray-50/50">
                <CardContent className="py-12 flex flex-col items-center text-center text-gray-500">
                  <Mail className="h-10 w-10 mb-2 opacity-20" />
                  <p>Nenhum convite pendente no momento.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {invites.map((invite) => (
                  <Card key={invite.id}>
                    <CardContent className="py-4 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="bg-orange-100 p-2.5 rounded-full">
                          <Mail className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {invite.email}
                          </p>
                          <p className="text-xs text-gray-500">
                            Enviado em{" "}
                            {new Date(invite.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className="text-orange-600 border-orange-200 bg-orange-50"
                        >
                          Aguardando
                        </Badge>
                        {can("manage_team") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleCancelInvite(invite.id)}
                            title="Cancelar convite"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
