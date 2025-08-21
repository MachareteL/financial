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
import { ArrowLeft, Users, UserPlus, Mail, Edit, Trash2, Plus } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getUserProfile } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"

interface FamilyMember {
  id: string
  name: string
  email: string
  role_id: string | null
  created_at: string
  family_roles?: {
    id: string
    name: string
    color: string
  }
}

interface FamilyRole {
  id: string
  name: string
  color: string
  permissions: string[]
  is_default: boolean
  created_at: string
}

interface FamilyInvite {
  id: string
  email: string
  role_id: string | null
  status: string
  created_at: string
  family_roles?: {
    name: string
    color: string
  }
}

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
  { key: "manage_family", label: "Gerenciar Família" },
  { key: "manage_roles", label: "Gerenciar Cargos" },
]

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
]

export default function FamilyPage() {
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [familyRoles, setFamilyRoles] = useState<FamilyRole[]>([])
  const [familyInvites, setFamilyInvites] = useState<FamilyInvite[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Dialog states
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false)
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<FamilyRole | null>(null)

  // Form states
  const [newRoleName, setNewRoleName] = useState("")
  const [newRoleColor, setNewRoleColor] = useState(ROLE_COLORS[0])
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([])
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRoleId, setInviteRoleId] = useState<string>("default")
  const [newProfileName, setNewProfileName] = useState("")

  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
      return
    }

    if (user && !profile) {
      loadProfile()
    }
  }, [user, loading, router])

  useEffect(() => {
    if (profile) {
      loadFamilyData()
    }
  }, [profile])

  const loadProfile = async () => {
    try {
      const userProfile = await getUserProfile()
      if (!userProfile) {
        router.push("/auth")
        return
      }
      setProfile(userProfile)
      setNewProfileName(userProfile.name)
    } catch (error) {
      console.error("Error loading profile:", error)
      router.push("/auth")
    }
  }

  const loadFamilyData = async () => {
    if (!profile?.family_id) return

    setIsLoading(true)
    try {
      // Load family members
      const { data: members, error: membersError } = await supabase
        .from("profiles")
        .select(`
          id, name, email, role_id, created_at,
          family_roles (id, name, color)
        `)
        .eq("family_id", profile.family_id)
        .order("created_at")

      if (membersError) throw membersError

      // Load family roles
      const { data: roles, error: rolesError } = await supabase
        .from("family_roles")
        .select("*")
        .eq("family_id", profile.family_id)
        .order("created_at")

      if (rolesError) throw rolesError

      // Load family invites
      const { data: invites, error: invitesError } = await supabase
        .from("family_invites")
        .select(`
          id, email, role_id, status, created_at,
          family_roles (name, color)
        `)
        .eq("family_id", profile.family_id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })

      if (invitesError) throw invitesError

      setFamilyMembers(members || [])
      setFamilyRoles(roles || [])
      setFamilyInvites(invites || [])
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados da família",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { error } = await supabase.from("profiles").update({ name: newProfileName }).eq("id", profile.id)

      if (error) throw error

      setProfile({ ...profile, name: newProfileName })
      setIsEditProfileOpen(false)
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      })
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { error } = await supabase.from("family_roles").insert({
        name: newRoleName,
        color: newRoleColor,
        permissions: newRolePermissions,
        family_id: profile.family_id,
        is_default: false,
      })

      if (error) throw error

      setNewRoleName("")
      setNewRoleColor(ROLE_COLORS[0])
      setNewRolePermissions([])
      setIsCreateRoleOpen(false)
      loadFamilyData()

      toast({
        title: "Cargo criado",
        description: "O novo cargo foi criado com sucesso.",
      })
    } catch (error: any) {
      toast({
        title: "Erro ao criar cargo",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRole) return

    try {
      const { error } = await supabase
        .from("family_roles")
        .update({
          name: newRoleName,
          color: newRoleColor,
          permissions: newRolePermissions,
        })
        .eq("id", editingRole.id)

      if (error) throw error

      setEditingRole(null)
      setNewRoleName("")
      setNewRoleColor(ROLE_COLORS[0])
      setNewRolePermissions([])
      setIsEditRoleOpen(false)
      loadFamilyData()

      toast({
        title: "Cargo atualizado",
        description: "O cargo foi atualizado com sucesso.",
      })
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar cargo",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm("Tem certeza que deseja excluir este cargo?")) return

    try {
      const { error } = await supabase.from("family_roles").delete().eq("id", roleId)

      if (error) throw error

      loadFamilyData()
      toast({
        title: "Cargo excluído",
        description: "O cargo foi excluído com sucesso.",
      })
    } catch (error: any) {
      toast({
        title: "Erro ao excluir cargo",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { error } = await supabase.from("family_invites").insert({
        email: inviteEmail,
        role_id: inviteRoleId || null,
        family_id: profile.family_id,
        invited_by: profile.id,
        status: "pending",
      })

      if (error) throw error

      setInviteEmail("")
      setInviteRoleId("")
      setIsInviteOpen(false)
      loadFamilyData()

      toast({
        title: "Convite enviado",
        description: `Um convite foi enviado para ${inviteEmail}.`,
      })
    } catch (error: any) {
      toast({
        title: "Erro ao enviar convite",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleUpdateMemberRole = async (memberId: string, roleId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role_id: roleId || null })
        .eq("id", memberId)

      if (error) throw error

      loadFamilyData()
      toast({
        title: "Cargo atualizado",
        description: "O cargo do membro foi atualizado com sucesso.",
      })
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar cargo",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const openEditRole = (role: FamilyRole) => {
    setEditingRole(role)
    setNewRoleName(role.name)
    setNewRoleColor(role.color)
    setNewRolePermissions(role.permissions)
    setIsEditRoleOpen(true)
  }

  const togglePermission = (permission: string) => {
    setNewRolePermissions((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission],
    )
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Carregando família...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
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
              <h1 className="text-3xl font-bold text-gray-900">Família</h1>
              <p className="text-gray-600">Gerencie membros, cargos e permissões da família</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Perfil</DialogTitle>
                  <DialogDescription>Atualize suas informações pessoais</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={profile?.email || ""} disabled className="bg-gray-100" />
                    <p className="text-xs text-gray-500">O email não pode ser alterado</p>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditProfileOpen(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1">
                      Salvar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="members">Membros</TabsTrigger>
            <TabsTrigger value="roles">Cargos</TabsTrigger>
            <TabsTrigger value="invites">Convites</TabsTrigger>
          </TabsList>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Membros da Família</h2>
                <p className="text-gray-600">{familyMembers.length} membros</p>
              </div>
              <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Convidar Membro
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Convidar Novo Membro</DialogTitle>
                    <DialogDescription>Envie um convite para alguém se juntar à família</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleInviteMember} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="invite-email">Email</Label>
                      <Input
                        id="invite-email"
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="email@exemplo.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invite-role">Cargo (opcional)</Label>
                      <Select value={inviteRoleId} onValueChange={setInviteRoleId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cargo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Sem cargo</SelectItem>
                          {familyRoles.map((role) => (
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
                      <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)} className="flex-1">
                        Cancelar
                      </Button>
                      <Button type="submit" className="flex-1">
                        Enviar Convite
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {familyMembers.map((member) => (
                <Card key={member.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{member.name}</h3>
                          <p className="text-sm text-gray-600">{member.email}</p>
                        </div>
                      </div>
                      {member.id === profile?.id && <Badge variant="secondary">Você</Badge>}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm">Cargo</Label>
                        <Select
                          value={member.role_id || "default"}
                          onValueChange={(value) => handleUpdateMemberRole(member.id, value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sem cargo">
                              {member.family_roles && (
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: member.family_roles.color }}
                                  />
                                  {member.family_roles.name}
                                </div>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Sem cargo</SelectItem>
                            {familyRoles.map((role) => (
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

                      <div className="text-xs text-gray-500">
                        Membro desde {new Date(member.created_at).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Cargos da Família</h2>
                <p className="text-gray-600">Gerencie cargos e permissões</p>
              </div>
              <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Cargo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Cargo</DialogTitle>
                    <DialogDescription>Defina um novo cargo com permissões específicas</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateRole} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="role-name">Nome do Cargo</Label>
                        <Input
                          id="role-name"
                          value={newRoleName}
                          onChange={(e) => setNewRoleName(e.target.value)}
                          placeholder="Ex: Gerente, Visualizador..."
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
                              className={`w-8 h-8 rounded-full border-2 ${
                                newRoleColor === color ? "border-gray-900" : "border-gray-300"
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
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded">
                        {AVAILABLE_PERMISSIONS.map((permission) => (
                          <div key={permission.key} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission.key}
                              checked={newRolePermissions.includes(permission.key)}
                              onCheckedChange={() => togglePermission(permission.key)}
                            />
                            <Label htmlFor={permission.key} className="text-sm">
                              {permission.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateRoleOpen(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" className="flex-1">
                        Criar Cargo
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {familyRoles.map((role) => (
                <Card key={role.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: role.color }} />
                        <CardTitle className="text-lg">{role.name}</CardTitle>
                        {role.is_default && <Badge variant="secondary">Padrão</Badge>}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditRole(role)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        {!role.is_default && (
                          <Button variant="outline" size="sm" onClick={() => handleDeleteRole(role.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Permissões ({role.permissions.length})</h4>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 3).map((permission) => {
                            const permissionLabel = AVAILABLE_PERMISSIONS.find((p) => p.key === permission)?.label
                            return (
                              <Badge key={permission} variant="outline" className="text-xs">
                                {permissionLabel}
                              </Badge>
                            )
                          })}
                          {role.permissions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{role.permissions.length - 3} mais
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">
                        Criado em {new Date(role.created_at).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Edit Role Dialog */}
            <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Editar Cargo</DialogTitle>
                  <DialogDescription>Atualize as informações e permissões do cargo</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateRole} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-role-name">Nome do Cargo</Label>
                      <Input
                        id="edit-role-name"
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
                            className={`w-8 h-8 rounded-full border-2 ${
                              newRoleColor === color ? "border-gray-900" : "border-gray-300"
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
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded">
                      {AVAILABLE_PERMISSIONS.map((permission) => (
                        <div key={permission.key} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-${permission.key}`}
                            checked={newRolePermissions.includes(permission.key)}
                            onCheckedChange={() => togglePermission(permission.key)}
                          />
                          <Label htmlFor={`edit-${permission.key}`} className="text-sm">
                            {permission.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => setIsEditRoleOpen(false)} className="flex-1">
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1">
                      Salvar Alterações
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Invites Tab */}
          <TabsContent value="invites" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Convites Pendentes</h2>
              <p className="text-gray-600">{familyInvites.length} convites aguardando resposta</p>
            </div>

            {familyInvites.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Mail className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum convite pendente</h3>
                  <p className="text-gray-600 text-center mb-4">
                    Todos os convites foram aceitos ou não há convites enviados.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {familyInvites.map((invite) => (
                  <Card key={invite.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <Mail className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{invite.email}</h3>
                            <p className="text-sm text-gray-600">
                              Enviado em {new Date(invite.created_at).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {invite.family_roles && (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: invite.family_roles.color }}
                              />
                              <span className="text-sm">{invite.family_roles.name}</span>
                            </div>
                          )}
                          <Badge variant="secondary">Pendente</Badge>
                        </div>
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
  )
}
