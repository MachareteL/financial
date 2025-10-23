"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { SignUpInputDTO } from "@/domain/dto/sign-up.dto"
import { SignInInputDTO } from "@/domain/dto/sign-in.dto"
import { signInUseCase, signUpUseCase } from "@/infrastructure/dependency-injection"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  setIsLoading(true)
  const formData = new FormData(e.currentTarget)
  const input: SignInInputDTO = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  try {
    await signInUseCase.execute(input)
    toast({ title: "Login realizado!", description: "Redirecionando..." })
    router.push("/dashboard")
  } catch (err: any) {
    toast({ title: "Erro no login", description: err.message, variant: "destructive" })
  } finally {
    setIsLoading(false)
  }
}

const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  setIsLoading(true)
  const formData = new FormData(e.currentTarget)
  const input: SignUpInputDTO = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  try {
    await signUpUseCase.execute(input)
    toast({ title: "Conta criada!", description: "Verifique seu email." })
  } catch (err: any) {
    toast({ title: "Erro no cadastro", description: err.message, variant: "destructive" })
  } finally {
    setIsLoading(false)
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Finanças Familiares</CardTitle>
          <CardDescription>Gerencie suas finanças pessoais em família</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input id="signin-email" name="email" type="email" placeholder="seu@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Senha</Label>
                  <Input id="signin-password" name="password" type="password" placeholder="Sua senha" required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nome</Label>
                  <Input id="signup-name" name="name" type="text" placeholder="Seu nome completo" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" name="email" type="email" placeholder="seu@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input id="signup-password" name="password" type="password" placeholder="Crie uma senha" required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Cadastrando..." : "Cadastrar"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
