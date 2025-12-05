"use client";

import { useState } from "react";
import { updatePasswordUseCase } from "@/infrastructure/dependency-injection";
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
import { Loader2, Lock, Save, ShieldCheck } from "lucide-react";

export function SecurityTab() {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      notify.error("As senhas não coincidem.", "alterar senha");
      return;
    }

    setIsLoading(true);
    try {
      await updatePasswordUseCase.execute(password);
      notify.success("Senha alterada com sucesso!");
      setPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      notify.error(error, "alterar senha");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-muted bg-card">
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
          <CardDescription>
            Escolha uma senha forte para proteger sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="pt-2">
              <Button disabled={isLoading} type="submit">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Atualizar Senha
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6 flex items-start gap-4">
          <div className="bg-primary/10 p-2 rounded-full">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Conta Segura</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Sua conta está protegida com criptografia de ponta a ponta.
              Recomendamos usar uma senha única e forte.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
