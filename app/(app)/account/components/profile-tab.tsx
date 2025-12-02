"use client";

import { useState } from "react";
import { useAuth } from "@/app/auth/auth-provider";
import { updateProfileUseCase } from "@/infrastructure/dependency-injection";
import { notify } from "@/lib/notify-helper";
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
import { Loader2, User, Save, Mail } from "lucide-react";

export function ProfileTab() {
  const { session, setSession } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(session?.user?.name || "");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;

    setIsLoading(true);
    try {
      const updatedSession = await updateProfileUseCase.execute(
        session.user.id,
        {
          name,
        }
      );
      setSession(updatedSession);
      notify.success("Perfil atualizado!");
    } catch (error: unknown) {
      notify.error(error, "atualizar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-muted bg-card">
      <CardHeader>
        <CardTitle>Informações Pessoais</CardTitle>
        <CardDescription>
          Atualize seu nome e informações de exibição.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                value={session?.user?.email || ""}
                disabled
                className="pl-10 bg-muted/50"
              />
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-xs text-muted-foreground">
              O email não pode ser alterado.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <div className="relative">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
                placeholder="Seu nome"
                minLength={2}
              />
              <User className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="pt-2">
            <Button disabled={isLoading} type="submit">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
