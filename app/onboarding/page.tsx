"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Plus, UserPlus } from "lucide-react"
import { createFamily, getUserProfile } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"

export default function OnboardingPage() {
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
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
    // Se usuário já tem família, redirecionar para dashboard
    if (profile?.family_id) {
      router.push("/dashboard")
    }
  }, [profile, router])

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

  const handleCreateFamily = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const familyName = formData.get("familyName") as string

    try {
      await createFamily(familyName)
      toast({
        title: "Família criada com sucesso!",
        description: `A família "${familyName}" foi criada.`,
      })
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Erro ao criar família",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo, {profile.name}!</h1>
          <p className="text-gray-600">Para começar, você precisa criar uma família ou ser convidado para uma.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Criar Nova Família */}
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Criar Nova Família</CardTitle>
              <CardDescription>Comece uma nova família financeira e convide outros membros depois</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateFamily} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="familyName">Nome da Família</Label>
                  <Input
                    id="familyName"
                    name="familyName"
                    placeholder="Ex: Família Silva"
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Criando..." : "Criar Família"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Aguardar Convite */}
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <UserPlus className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Aguardar Convite</CardTitle>
              <CardDescription>
                Se alguém da sua família já tem uma conta, peça para te convidar pelo seu email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Seu email para convite:</p>
                <p className="font-medium text-gray-900">{profile.email}</p>
              </div>
              <p className="text-sm text-gray-500 text-center">
                Quando receber o convite, você será automaticamente adicionado à família.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Como funciona
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">1</span>
              </div>
              <div>
                <h4 className="font-medium">Crie ou entre em uma família</h4>
                <p className="text-sm text-gray-600">
                  Famílias compartilham gastos, categorias e orçamentos. Todos os membros podem ver e adicionar gastos.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">2</span>
              </div>
              <div>
                <h4 className="font-medium">Convide outros membros</h4>
                <p className="text-sm text-gray-600">
                  Depois de criar a família, você pode convidar cônjuge, filhos ou outros familiares.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">3</span>
              </div>
              <div>
                <h4 className="font-medium">Gerencie as finanças juntos</h4>
                <p className="text-sm text-gray-600">
                  Acompanhem gastos, definam orçamentos e alcancem metas financeiras em família.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
