"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { notify } from "@/lib/notify-helper";

// Use Cases
import {
  signInUseCase,
  signUpUseCase,
  resetPasswordUseCase,
} from "@/infrastructure/dependency-injection";
import { SignUpInputDTO } from "@/domain/dto/sign-up.dto";
import { SignInInputDTO } from "@/domain/dto/sign-in.dto";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, TrendingUp, CheckCircle2, Sparkles } from "lucide-react";
import { LegalDisclaimer } from "@/app/auth/_components/legal-disclaimer";
import { Logo } from "@/components/lemon/logo";

export default function AuthPage() {
  const router = useRouter();
  const auth = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  // --- Handlers ---

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const input: SignInInputDTO = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    try {
      const session = await signInUseCase.execute(input);
      auth.setSession(session);
      notify.success("Bem-vindo de volta!", {
        description: "Login realizado com sucesso.",
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      notify.error(err, "fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const input: SignUpInputDTO = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    try {
      await signUpUseCase.execute(input);
      notify.success("Conta criada com sucesso!", {
        description: "Seu acesso já está liberado. Bem-vindo ao time!",
      });
      // Opcional: Auto-login após cadastro se a API permitir, ou pedir para logar
      // Por padrão do fluxo anterior, o usuário não é logado automaticamente se tiver verify email
      // Mas se o RLS permitir, ele pode logar. Vamos manter o usuário na tela para ele fazer login ou ver o aviso.
    } catch (err: unknown) {
      notify.error(err, "criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return notify.error("Digite seu email", "recuperar senha");

    setIsLoading(true);
    try {
      await resetPasswordUseCase.execute(resetEmail);
      notify.success("Código enviado!", {
        description: "Verifique seu email para pegar o código de 6 dígitos.",
      });
      setIsResetOpen(false);
      router.push(`/auth/verify-code?email=${encodeURIComponent(resetEmail)}`);
      setResetEmail("");
    } catch (err: unknown) {
      notify.error(err, "enviar email de recuperação");
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

      {/* --- DIREITA: FORMULÁRIOS --- */}
      <div className="flex items-center justify-center p-6 lg:p-10 bg-background">
        <div className="mx-auto w-full max-w-[400px] space-y-8">
          <div className="flex flex-col space-y-2 text-center">
            <div className="lg:hidden flex justify-center mb-4">
              <Logo className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Bem-vindo ao Lemon
            </h1>
            <p className="text-sm text-muted-foreground">
              Sua jornada para a liberdade financeira começa aqui.
            </p>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar Conta</TabsTrigger>
            </TabsList>

            {/* LOGIN */}
            <TabsContent value="signin">
              <form
                onSubmit={handleSignIn}
                className="space-y-4 animate-in fade-in zoom-in-95 duration-300"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>

                    {/* Link de Recuperação de Senha */}
                    <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="link"
                          size="sm"
                          className="px-0 font-normal text-xs text-primary h-auto"
                        >
                          Esqueceu a senha?
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Recuperar Senha</DialogTitle>
                          <DialogDescription>
                            Digite seu email para receber um link de
                            redefinição.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                          <div className="space-y-2">
                            <Label htmlFor="reset-email">Email</Label>
                            <Input
                              id="reset-email"
                              placeholder="seu@email.com"
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                            />
                          </div>
                          <Button
                            onClick={handleResetPassword}
                            disabled={isLoading}
                            className="w-full"
                          >
                            {isLoading ? (
                              <Loader2 className="animate-spin w-4 h-4" />
                            ) : (
                              "Enviar Link"
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="bg-background"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full shadow-sm font-bold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* CADASTRO */}
            <TabsContent value="signup">
              <form
                onSubmit={handleSignUp}
                className="space-y-4 animate-in fade-in zoom-in-95 duration-300"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Como você quer ser chamado?"
                    required
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    required
                    className="bg-background"
                  />
                </div>

                <div className="bg-muted/40 p-4 rounded-lg space-y-3 border border-border/50">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    O que você ganha:
                  </p>
                  <div className="text-sm space-y-2">
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>IA que lê seus recibos</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Método 50/30/20 automático</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Gestão compartilhada (Casal)</span>
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full shadow-sm font-bold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  ) : (
                    "Começar Grátis"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <LegalDisclaimer />
        </div>
      </div>
    </div>
  );
}
