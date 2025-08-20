"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserPlus, Trash2, ArrowLeft, Mail, Crown, User } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getUserProfile } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"

interface FamilyMember {
  id: string
  name: string
  email: string
  created_at: string
  is_admin?: boolean
}

interface PendingInvite {
  id: string
  email: string
  invited_by: string
  created_at: string
  inviterName: string | null
}

export default function FamilyPage() {
  const { user, loading } = useAuth()
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
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
      loadFamilyMembers()
      loadPendingInvites()
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
    } catch (error) {
      console.error("Error loading profile:", error)
      router.push("/auth")
    }
  }

  const loadFamilyMembers = async () => {
    if (!profile?.family_id) return

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("family_id", profile.family_id)
        .order("created_at")

      if (error) throw error

      // Mark the current user as admin (first member or current user)
      const membersWithAdmin = (data || []).map((member, index) => ({
        ...member,
        is_admin: index === 0 || member.id === user?.id,
      }))

      setMembers(membersWithAdmin)
    } catch (error: any) {
      toast({
        title: "Erro ao carregar membros",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const loadPendingInvites = async () => {
    if (!profile?.family_id) return

    try {
      // 1) pega convites
      const { data: invites, error: invitesError } = await supabase
        .from("family_invites")
        .select("id, email, invited_by, created_at")
        .eq("family_id", profile.family_id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })

      if (invitesError) throw invitesError

      if (!invites || invites.length === 0) {
        setPendingInvites([])
        return
      }

      // 2) pega perfis de quem convidou
      const inviterIds = invites.map((i) => i.invited_by)
      const { data: inviters, error: invitersError } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", inviterIds)

      if (invitersError) throw invitersError

      const nameMap = new Map(inviters.map((p) => [p.id, p.name as string]))
      const pending = invites.map((i) => ({
        ...i,
        inviterName: nameMap.get(i.invited_by) ?? null,
      }))

      setPendingInvites(pending)
    } catch (error: any) {
      console.error("Error loading invites:", error)
    }
  }

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string

    try {
      // Check if user already exists
      const { data: existingUser } = await supabase.from("profiles").select("*").eq("email", email).single()

      if (existingUser) {
        if (existingUser.family_id === profile.family_id) {
          throw new Error("Este usuário já faz parte da sua família")
        }
        if (existingUser.family_id) {
          throw new Error("Este usuário já faz parte de outra família")
        }

        // Add existing user to family
        const { error } = await supabase
          .from("profiles")
          .update({ family_id: profile.family_id })
          .eq("id", existingUser.id)

        if (error) throw error

        toast({
          title: "Membro adicionado com sucesso!",
          description: `${existingUser.name} foi adicionado à sua família.`,
        })
      } else {
        // Create invite for new user
        const { error } = await supabase.from("family_invites").insert({
          email,
          family_id: profile.family_id,
          invited_by: profile.id,
          status: "pending",
        })

        if (error) throw error

        toast({
          title: "Convite enviado!",
          description: `Um convite foi enviado para ${email}.`,
        })
      }

      setIsInviteDialogOpen(false)
      loadFamilyMembers()
      loadPendingInvites()
    } catch (error: any) {
      toast({
        title: "Erro ao enviar convite",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const removeMember = async (memberId: string) => {
    if (memberId === user?.id) {
      toast({
        title: "Erro",
        description: "Você não pode remover a si mesmo da família",
        variant: "destructive",
      })
      return
    }

    try {
      // Create a new family for the removed member
      const memberToRemove = members.find((m) => m.id === memberId)
      if (!memberToRemove) return

      const newFamilyId = crypto.randomUUID()

      // Create new family
      const { error: familyError } = await supabase
        .from("families")
        .insert({ id: newFamilyId, name: `Família de ${memberToRemove.name}` }, { returning: "minimal" })

      if (familyError) throw familyError

      // Move member to new family
      const { error } = await supabase.from("profiles").update({ family_id: newFamilyId }).eq("id", memberId)

      if (error) throw error

      toast({
        title: "Membro removido da família",
        description: `${memberToRemove.name} foi removido da família.`,
      })

      loadFamilyMembers()
    } catch (error: any) {
      toast({
        title: "Erro ao remover membro",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const cancelInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase.from("family_invites").delete().eq("id", inviteId)

      if (error) throw error

      toast({
        title: "Convite cancelado",
      })

      loadPendingInvites()
    } catch (error: any) {
      toast({
        title: "Erro ao cancelar convite",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Carregando...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Família</h1>
            <p className="text-gray-600">{profile?.family?.name}</p>
          </div>
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Convidar Membro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Convidar Membro</DialogTitle>
                <DialogDescription>Convide alguém para fazer parte da sua família financeira</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="email@exemplo.com" required />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsInviteDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? "Enviando..." : "Enviar Convite"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Family Members */}
        <Card>
          <CardHeader>
            <CardTitle>Membros da Família</CardTitle>
            <CardDescription>Pessoas que fazem parte da sua família financeira</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{member.name}</h3>
                        {member.is_admin && (
                          <Badge variant="secondary" className="text-xs">
                            <Crown className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                        {member.id === user?.id && (
                          <Badge variant="outline" className="text-xs">
                            Você
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </div>
                  </div>

                  {member.id !== user?.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja remover ${member.name} da família?`)) {
                          removeMember(member.id)
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Convites Pendentes</CardTitle>
              <CardDescription>Convites enviados aguardando resposta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingInvites.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          <Mail className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{invite.email}</h3>
                        <p className="text-sm text-gray-600">
                          Convidado por {invite.inviterName ?? "Desconhecido"} em{" "}
                          {new Date(invite.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Pendente</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm("Tem certeza que deseja cancelar este convite?")) {
                            cancelInvite(invite.id)
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Como funciona</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <UserPlus className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Convidar membros</h4>
                <p className="text-sm text-gray-600">
                  Convide familiares pelo email. Se já tiverem conta, serão adicionados imediatamente.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Compartilhar gastos</h4>
                <p className="text-sm text-gray-600">Todos os membros podem ver e adicionar gastos da família.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Crown className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Administração</h4>
                <p className="text-sm text-gray-600">Admins podem gerenciar membros e configurações da família.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
