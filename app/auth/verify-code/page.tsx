"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyRecoveryCodeUseCase } from "@/infrastructure/dependency-injection";
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
import { Loader2, ShieldCheck, ArrowLeft } from "lucide-react";

function VerifyCodeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      notify.error("Email não encontrado.", "verificar código");
      return;
    }
    if (code.length !== 6) {
      notify.error("O código deve ter 6 dígitos.", "verificar código");
      return;
    }

    setIsLoading(true);
    try {
      await verifyRecoveryCodeUseCase.execute(email, code);

      notify.success("Código verificado!", {
        description: "Agora você pode redefinir sua senha.",
      });

      router.push("/account/update-password");
    } catch (error: any) {
      notify.error(error, "verificar código");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-slate-200 shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            Verificar Código
          </CardTitle>
        </div>
        <CardDescription>
          Digite o código de 6 dígitos enviado para <strong>{email}</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Código de Verificação</Label>
            <Input
              id="code"
              type="text"
              placeholder="123456"
              required
              maxLength={6}
              className="text-center text-2xl tracking-widest"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
              ) : (
                "Verificar Código"
              )}
            </Button>
          </div>

          <div className="text-center pt-2">
            <Button
              variant="link"
              type="button"
              onClick={() => router.push("/auth")}
              className="text-slate-500 text-xs"
            >
              <ArrowLeft className="w-3 h-3 mr-1" /> Voltar para Login
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function VerifyCodePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Suspense fallback={<div>Carregando...</div>}>
        <VerifyCodeContent />
      </Suspense>
    </div>
  );
}
