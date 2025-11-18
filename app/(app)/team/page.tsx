"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Users, UserPlus, Mail, Edit, Trash2, Plus, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/app/auth/auth-provider"
import { useTeam } from "@/app/(app)/team/team-provider"

// Importações de DTOs e Entidades
import type { TeamMemberProfileDTO } from "@/domain/dto/team.types.d.ts"
import type { TeamRole } from "@/domain/entities/team-role"
import type { TeamInvite } from "@/domain/entities/team-invite"

// Importações de Casos de Uso (DI)
import {
  getTeamDataUseCase,
  manageRolesUseCase,
  manageMembersUseCase
} from "@/infrastructure/dependency-injection"

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
  { key: "manage_family", label: "Gerenciar Equipe" },
  { key: "manage_roles", label: "Gerenciar Cargos" },
]

const ROLE_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4",
  "#3b82f6", "#8b5cf6", "#ec4899", "#f43f5e", "#84cc16",
]

export default function TeamPage() {
  const { session } = useAuth()
  const { currentTeam } = useTeam()
  const router = useRouter()

  // Estados de Dados
  const [members, setMembers] = useState<TeamMemberProfileDTO[]>([])
  const [roles, setRoles] = useState<TeamRole[]>([])
  const [invites, setInvites] = useState<TeamInvite[]>([])
  
  // Estados de UI
  const [isLoading, setIsLoading] = useState(true) // Loading de dados
  const [isActionLoading, setIsActionLoading] = useState(false) // Loading de ações

  // Dialogs
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false)
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<TeamRole | null>(null)

  // Forms
  const [newRoleName, setNewRoleName] = useState("")
  const [newRoleColor, setNewRoleColor] = useState(ROLE_COLORS[0])
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([])
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRoleId, setInviteRoleId] = useState<string>("")

  useEffect(() => {
    if (currentTeam) {
      loadTeamData()
    }
  }, [currentTeam])

  const loadTeamData = async () => {
    if (!currentTeam) return
    setIsLoading(true)
    try {
      const data = await getTeamDataUseCase.execute(currentTeam.team.id)
      setMembers(data.members)
      setRoles(data.roles)
      setInvites(data.invites)
    } catch (error: any) {
      toast({ title: "Erro ao carregar dados", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  // --- ACTIONS: ROLES ---

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentTeam) return

    setIsActionLoading(true)
    try {
      await manageRolesUseCase.createRole({
        teamId: currentTeam.team.id,
        name: newRoleName,
        color: newRoleColor,
        permissions: newRolePermissions,
      })

      toast({ title: "Cargo criado com sucesso!" })
      setIsCreateRoleOpen(false)
      resetRoleForm()
      await loadTeamData()
    } catch (error: any) {
      toast({ title: "Erro ao criar cargo", description: error.message, variant: "destructive" })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentTeam || !editingRole) return

    setIsActionLoading(true)
    try {
      await manageRolesUseCase.updateRole({
        roleId: editingRole.id,
        teamId: currentTeam.team.id,
        name: newRoleName,
        color: newRoleColor,
        permissions: newRolePermissions,
      })

      toast({ title: "Cargo atualizado com sucesso!" })
      setIsEditRoleOpen(false)
      resetRoleForm()
      await loadTeamData()
    } catch (error: any) {
      toast({ title: "Erro ao atualizar cargo", description: error.message, variant: "destructive" })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!currentTeam) return
    if (!confirm("Tem certeza que deseja excluir este cargo? Membros com este cargo ficarão sem permissões.")) return

    setIsActionLoading(true)
    try {
      await manageRolesUseCase.deleteRole(roleId, currentTeam.team.id)
      toast({ title: "Cargo excluído com sucesso!" })
      await loadTeamData()
    } catch (error: any) {
      toast({ title: "Erro ao excluir cargo", description: error.message, variant: "destructive" })
    } finally {
      setIsActionLoading(false)
    }
  }

  // --- ACTIONS: MEMBERS & INVITES ---

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentTeam || !session?.user) return

    setIsActionLoading(true)
    try {
      await manageMembersUseCase.inviteMember({
        teamId: currentTeam.team.id,
        email: inviteEmail,
        roleId: inviteRoleId || null,
        invitedBy: session.user.id
      })

      toast({ title: "Convite enviado!", description: `Para: ${inviteEmail}` })
      setInviteEmail("")
      setInviteRoleId("")
      setIsInviteOpen(false)
      await loadTeamData()
    } catch (error: any) {
      toast({ title: "Erro ao convidar", description: error.message, variant: "destructive" })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleUpdateMemberRole = async (memberId: string, roleId: string) => {
    if (!currentTeam) return
    // setIsActionLoading(true) // Opcional: bloquear a UI
    try {
      await manageMembersUseCase.updateMemberRole({
        teamId: currentTeam.team.id,
        memberId,
        roleId: roleId === "default" ? null : roleId
      })
      toast({ title: "Permissão atualizada" })
      await loadTeamData()
    } catch (error: any) {
      toast({ title: "Erro ao atualizar membro", description: error.message, variant: "destructive" })
    } 
  }
  
  const handleRemoveMember = async (memberId: string) => {
      if (!currentTeam) return
      if(!confirm("Tem certeza que deseja remover este membro da equipe?")) return;
      
      setIsActionLoading(true);
      try {
          await manageMembersUseCase.removeMember(currentTeam.team.id, memberId);
          toast({ title: "Membro removido." });
          await loadTeamData();
      } catch (error: any) {
        toast({ title: "Erro ao remover", description: error.message, variant: "destructive" })
      } finally {
        setIsActionLoading(false);
      }
  }

  // --- HELPERS ---

  const openEditRole = (role: TeamRole) => {
    setEditingRole(role)
    setNewRoleName(role.name)
    setNewRoleColor(role.color)
    setNewRolePermissions(role.permissions)
    setIsEditRoleOpen(true)
  }

  const resetRoleForm = () => {
    setEditingRole(null)
    setNewRoleName("")
    setNewRoleColor(ROLE_COLORS[0])
    setNewRolePermissions([])
  }

  const togglePermission = (permission: string) => {
    setNewRolePermissions((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission],
    )
  }

  if (!currentTeam || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-gray-900 mx-auto" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Equipe: {currentTeam.team.name}</h1>
              <p className="text-gray-600">Gerencie membros, cargos e permissões</p>
            </div>
          </div>
          {/* Botão do Perfil (removido daqui, pois já está no layout header) */}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="members">Membros</TabsTrigger>
            <TabsTrigger value="roles">Cargos</TabsTrigger>
            <TabsTrigger value="invites">Convites</TabsTrigger>
          </TabsList>

          {/* ABA: MEMBROS */}
          <TabsContent value="members" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Membros da Equipe</h2>
                <p className="text-gray-600">{members.length} membros ativos</p>
              </div>
              <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Convidar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Convidar Novo Membro</DialogTitle>
                    <DialogDescription>O usuário receberá acesso à equipe {currentTeam.team.name}</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleInviteMember} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="email@exemplo.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cargo Inicial</Label>
                      <Select value={inviteRoleId} onValueChange={setInviteRoleId}>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Sem cargo (padrão)</SelectItem>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }} />
                                {role.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-4">
                      <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)} className="flex-1">Cancelar</Button>
                      <Button type="submit" disabled={isActionLoading} className="flex-1">
                         {isActionLoading ? <Loader2 className="animate-spin"/> : "Enviar Convite"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <Card key={member.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                           {member.name.substring(0,2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold">{member.name}</h3>
                          <p className="text-sm text-gray-600 truncate max-w-[150px]">{member.email}</p>
                        </div>
                      </div>
                      {member.id === session?.user?.id && <Badge variant="secondary">Você</Badge>}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-500">Cargo</Label>
                        <Select
                          value={member.roleId || "default"}
                          onValueChange={(value) => handleUpdateMemberRole(member.id, value)}
                          disabled={member.id === session?.user?.id} // Não pode mudar o próprio cargo aqui por segurança
                        >
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Sem cargo">
                              {member.teamRole && (
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: member.teamRole.color }} />
                                  {member.teamRole.name}
                                </div>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {/* <SelectItem value="default">Sem cargo</SelectItem> */}
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }} />
                                  {role.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {member.id !== session?.user?.id && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                              <Trash2 className="w-4 h-4 mr-2"/> Remover
                          </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ABA: CARGOS */}
          <TabsContent value="roles" className="space-y-4">
             {/* ... (Mesma estrutura da sua página antiga, mas usando os handlers e estados novos) ... */}
             <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Cargos da Equipe</h2>
                <p className="text-gray-600">Defina o que cada pessoa pode fazer.</p>
              </div>
              <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetRoleForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Cargo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                   <DialogHeader>
                    <DialogTitle>Criar Novo Cargo</DialogTitle>
                  </DialogHeader>
                  {/* REUTILIZANDO O FORMULÁRIO PARA CRIAR */}
                  <form onSubmit={handleCreateRole} className="space-y-4">
                     {/* ... (Inputs de Nome, Cor e Checkboxes de Permissão) ... */}
                     {/* (Vou simplificar aqui, copie o JSX do seu arquivo antigo para os inputs e checkboxes) */}
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nome</Label>
                            <Input value={newRoleName} onChange={e => setNewRoleName(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Cor</Label>
                             <div className="flex gap-2 flex-wrap">
                                {ROLE_COLORS.map((color) => (
                                    <button
                                    key={color}
                                    type="button"
                                    className={`w-6 h-6 rounded-full border ${newRoleColor === color ? "border-black ring-2" : "border-transparent"}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setNewRoleColor(color)}
                                    />
                                ))}
                            </div>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <Label>Permissões</Label>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border p-2 rounded">
                            {AVAILABLE_PERMISSIONS.map(perm => (
                                <div key={perm.key} className="flex items-center space-x-2">
                                    <Checkbox id={perm.key} checked={newRolePermissions.includes(perm.key)} onCheckedChange={() => togglePermission(perm.key)} />
                                    <Label htmlFor={perm.key}>{perm.label}</Label>
                                </div>
                            ))}
                        </div>
                     </div>
                     <Button type="submit" className="w-full" disabled={isActionLoading}>
                        {isActionLoading ? <Loader2 className="animate-spin"/> : "Criar Cargo"}
                     </Button>
                  </form>
                </DialogContent>
              </Dialog>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.map(role => (
                    <Card key={role.id}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: role.color }} />
                                    <CardTitle className="text-lg">{role.name}</CardTitle>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => openEditRole(role)}><Edit className="w-4 h-4"/></Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteRole(role.id)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-1">
                                {role.permissions.slice(0, 5).map(p => (
                                    <Badge key={p} variant="outline" className="text-xs text-gray-500">{AVAILABLE_PERMISSIONS.find(ap => ap.key === p)?.label || p}</Badge>
                                ))}
                                {role.permissions.length > 5 && <Badge variant="outline" className="text-xs">+{role.permissions.length - 5}</Badge>}
                            </div>
                        </CardContent>
                    </Card>
                ))}
             </div>
             
             {/* Dialog de Edição (mesmo form do create, mas com handleUpdateRole) */}
             <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>Editar Cargo</DialogTitle></DialogHeader>
                    <form onSubmit={handleUpdateRole} className="space-y-4">
                         {/* ... (Mesmos inputs de Nome, Cor, Permissões) ... */}
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nome</Label>
                                <Input value={newRoleName} onChange={e => setNewRoleName(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Cor</Label>
                                <div className="flex gap-2 flex-wrap">
                                    {ROLE_COLORS.map((color) => (
                                        <button key={color} type="button" className={`w-6 h-6 rounded-full border ${newRoleColor === color ? "border-black ring-2" : "border-transparent"}`} style={{ backgroundColor: color }} onClick={() => setNewRoleColor(color)} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Permissões</Label>
                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border p-2 rounded">
                                {AVAILABLE_PERMISSIONS.map(perm => (
                                    <div key={perm.key} className="flex items-center space-x-2">
                                        <Checkbox id={`edit-${perm.key}`} checked={newRolePermissions.includes(perm.key)} onCheckedChange={() => togglePermission(perm.key)} />
                                        <Label htmlFor={`edit-${perm.key}`}>{perm.label}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isActionLoading}>
                            {isActionLoading ? <Loader2 className="animate-spin"/> : "Salvar Alterações"}
                        </Button>
                    </form>
                </DialogContent>
             </Dialog>
          </TabsContent>

          {/* ABA: CONVITES */}
          <TabsContent value="invites" className="space-y-4">
            <div className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold">Convites Pendentes</h2>
                {invites.length === 0 ? (
                    <Card><CardContent className="py-8 text-center text-gray-500">Nenhum convite pendente.</CardContent></Card>
                ) : (
                    <div className="space-y-2">
                        {invites.map(invite => (
                            <Card key={invite.id}>
                                <CardContent className="py-4 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <Mail className="text-orange-500"/>
                                        <div>
                                            <p className="font-medium">{invite.email}</p>
                                            <p className="text-xs text-gray-500">Enviado em {new Date().toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary">Pendente</Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}