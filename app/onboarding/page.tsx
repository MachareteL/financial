"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Plus, UserPlus } from "lucide-react";

import { useAuth } from "@/app/auth/auth-provider";
import { createTeamUseCase } from "@/infrastructure/dependency-injection";
import { notify } from "@/lib/notify-helper";

export default function OnboardingPage() {
  const { session, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {

    if (!loading && !session) {
      router.push("/auth");
      return;
    }

    if (session?.teams && session.teams.length > 0) {
      router.push("/dashboard");
    }
  }, [session, loading, router]);


  const handleCreateTeam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!session?.user) return;

    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    const teamName = formData.get("teamName") as string;

    try {
      // 8. Chamar o UseCase limpo
      await createTeamUseCase.execute({
        teamName,
        userId: session.user.id,
      });

      notify.success("Equipe criada com sucesso!", {
        description: `A equipe "${teamName}" foi criada.`,
      });

      router.refresh();
      
    } catch (error: any) {
      notify.error(error, "criar a equipe");
    } finally {
      setIsLoading(false);
    }
  };


  if (loading || !session || (session.teams && session.teams.length > 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Carregando...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo, {session.user.name}!
          </h1>
          <p className="text-gray-600">
            Para começar, você precisa criar um time/equipe ou ser convidado para um(a).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Criar Nova equipe</CardTitle>
              <CardDescription>
                Comece um novo time financeiro e convide outros membros depois
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName">Nome do Time</Label>
                  <Input
                    id="teamName"
                    name="teamName"
                    placeholder="Ex: Família Silva"
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Criando..." : "Criar Equipe"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <UserPlus className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Aguardar Convite</CardTitle>
              <CardDescription>
                Se alguém da sua equipe já tem uma conta, peça para te convidar
                pelo seu email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  Seu email para convite:
                </p>
                <p className="font-medium text-gray-900">{session.user.email}</p>
              </div>
              <p className="text-sm text-gray-500 text-center">
                Quando receber o convite, você será automaticamente adicionado ao
                time.
              </p>
            </CardContent>
          </Card>
        </div>
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
                <h4 className="font-medium">Cada pessoa tem um Time ou uma Equipe</h4>
                <p className="text-sm text-gray-600">
                  Um "time" é o espaço compartilhado onde vocês organizam a vida financeira em conjunto.
                  Pode ser um time de trabalho, uma família ou qualquer grupo que queira gerenciar finanças em comum.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">2</span>
              </div>
              <div>
                <h4 className="font-medium">Compartilhe gastos, categorias e orçamentos</h4>
                <p className="text-sm text-gray-600">
                  Membros do time podem ver e adicionar despesas, criar categorias e definir orçamentos. Tudo é centralizado no time para facilitar acompanhamento e planejamento.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">3</span>
              </div>
              <div>
                <h4 className="font-medium">Convide e gerencie membros</h4>
                <p className="text-sm text-gray-600">
                  Você pode criar um time e convidar outras pessoas por e-mail. O criador do time pode gerenciar membros e permissões, garantindo privacidade e controle sobre quem vê os dados.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}