"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyRecoveryCodeUseCase } from "@/infrastructure/dependency-injection";
import { notify } from "@/lib/notify-helper";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  TrendingUp,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/lemon/logo";
import { LegalDisclaimer } from "@/app/auth/_components/legal-disclaimer";

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
    } catch (error: unknown) {
      notify.error(error, "verificar código");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2 overflow-hidden bg-background">
      {/* --- ESQUERDA: BRANDING (Visível apenas em Desktop) --- */}
      <div className="hidden lg:flex flex-col justify-between bg-zinc-900 text-white p-10 relative overflow-hidden">
        <div className="absolute top-10 left-10 z-10 flex items-center gap-2 font-bold text-2xl">
          <Logo className="w-8 h-8" />
          Lemon
        </div>

        {/* Visual Background Effects */}
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] translate-y-1/4 -translate-x-1/4 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] -translate-y-1/4 translate-x-1/4 pointer-events-none"></div>

        {/* Abstract Grid Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10 pointer-events-none"></div>

        <div className="relative z-10 mt-auto mb-20 max-w-lg">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold leading-tight">
              A causa <span className="text-primary">#1</span> de estresse entre
              casais é financeira.
            </h2>
            <p className="text-lg text-zinc-300 leading-relaxed">
              Assumam o controle da própria vida financeira. Insights realistas
              e personalizados mostram exatamente onde cortar, sem sacrificar o
              que importa.
            </p>

            <div className="mt-8 bg-zinc-800/50 border border-zinc-700 p-6 rounded-xl backdrop-blur-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="w-32 h-32 text-primary" />
              </div>

              <div className="flex items-start gap-4 relative z-10">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg mb-1">
                    Lemon AI impulsiona seus resultados
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Teste gratuitamente e receba insights automáticos: descubra
                    onde o dinheiro está vazando e como otimizar o orçamento do
                    casal sem esforço.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-zinc-500">
          © 2025 Lemon Financial Inc.
        </div>
      </div>

      {/* --- DIREITA: CONTEÚDO --- */}
      <div className="flex items-center justify-center p-6 lg:p-10 bg-background">
        <div className="mx-auto w-full max-w-[400px] space-y-8">
          <div className="flex flex-col space-y-2 text-center">
            <div className="lg:hidden flex justify-center mb-4">
              <Logo className="w-10 h-10" />
            </div>
            <div className="flex justify-center mb-2">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Verificar Código
            </h1>
            <p className="text-sm text-muted-foreground">
              Digite o código de 6 dígitos enviado para <br />
              <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code" className="sr-only">
                Código de Verificação
              </Label>
              <Input
                id="code"
                type="text"
                placeholder="000000"
                required
                maxLength={6}
                className="text-center text-3xl tracking-[1em] h-14 font-mono uppercase placeholder:tracking-normal"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
              />
              <p className="text-xs text-center text-muted-foreground">
                Não recebeu? Verifique sua caixa de spam.
              </p>
            </div>

            <div className="space-y-4">
              <Button
                type="submit"
                className="w-full shadow-sm font-bold h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                ) : (
                  "Verificar e Continuar"
                )}
              </Button>

              <Button
                variant="ghost"
                type="button"
                onClick={() => router.push("/auth")}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Login
              </Button>
            </div>
          </form>

          <LegalDisclaimer />
        </div>
      </div>
    </div>
  );
}

export default function VerifyCodePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="animate-spin w-8 h-8 text-primary" />
        </div>
      }
    >
      <VerifyCodeContent />
    </Suspense>
  );
}
