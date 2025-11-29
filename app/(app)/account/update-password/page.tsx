"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePasswordUseCase } from "@/infrastructure/dependency-injection";
import { notify } from "@/lib/notify-helper";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, Lock, ShieldCheck, ArrowLeft } from "lucide-react";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      notify.error("As senhas não coincidem", "atualizar senha");
      return;
    }

    setIsLoading(true);
    try {
      await updatePasswordUseCase.execute(password);

      notify.success("Senha atualizada!", {
        description: "Você já pode usar sua nova senha.",
      });

      // Redireciona para o dashboard pois o usuário já está logado
      router.push("/dashboard");
    } catch (error: any) {
      notify.error(error, "atualizar senha");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-primary" />
              Nova Senha
            </CardTitle>
          </div>
          <CardDescription>
            Digite sua nova senha segura abaixo para recuperar o acesso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmar Senha</Label>
              <div className="relative">
                <Input
                  id="confirm"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="pl-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                ) : (
                  "Alterar Senha e Entrar"
                )}
              </Button>
            </div>

            <div className="text-center pt-2">
              <Button
                variant="link"
                type="button"
                onClick={() => router.push("/auth")}
                className="text-muted-foreground text-xs"
              >
                <ArrowLeft className="w-3 h-3 mr-1" /> Voltar para Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
