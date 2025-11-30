"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "./auth-provider";
import { notify } from "@/lib/notify-helper";

// Use Cases
import {
  signInAction,
  signUpAction,
  resetPasswordAction,
} from "./_actions/auth.actions";
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
import { Loader2, TrendingUp, CheckCircle2 } from "lucide-react";

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
      const session = await signInAction(input);
      auth.setSession(session);
      notify.success("Bem-vindo de volta!", {
        description: "Login realizado com sucesso.",
      });
      router.push("/dashboard");
    } catch (err: any) {
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
      await signUpAction(input);
      notify.success("Conta criada com sucesso!", {
        description: "Seu acesso já está liberado. Bem-vindo ao time!",
      });
      // Opcional: Auto-login após cadastro se a API permitir, ou pedir para logar
      // Por padrão do fluxo anterior, o usuário não é logado automaticamente se tiver verify email
      // Mas se o RLS permitir, ele pode logar. Vamos manter o usuário na tela para ele fazer login ou ver o aviso.
    } catch (err: any) {
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
      await resetPasswordAction(resetEmail);
      notify.success("Código enviado!", {
        description: "Verifique seu email para pegar o código de 6 dígitos.",
      });
      setIsResetOpen(false);
      router.push(`/auth/verify-code?email=${encodeURIComponent(resetEmail)}`);
      setResetEmail("");
    } catch (err: any) {
      notify.error(err, "enviar email de recuperação");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2 overflow-hidden bg-background">
      {/* --- ESQUERDA: BRANDING (Visível apenas em Desktop) --- */}
      <div className="hidden lg:flex flex-col justify-between bg-muted text-foreground p-10 relative overflow-hidden">
        <div className="absolute top-10 left-10 z-10 flex items-center gap-2 font-bold text-2xl text-foreground">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary-foreground" />
          </div>
          Lemon
        </div>

        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>

        <div className="relative z-10 mt-auto mb-20">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;O Lemon transformou a maneira como gerenciamos nossas
              finanças em família. Simples, intuitivo e poderoso.&rdquo;
            </p>
            <footer className="text-sm text-muted-foreground">
              Sofia & Marcos
              <br />
              <span className="text-muted-foreground/80">
                Usuários desde 2024
              </span>
            </footer>
          </blockquote>
        </div>

        <div className="relative z-10 text-xs text-muted-foreground">
          © 2025 Lemon Inc.
        </div>
      </div>

      {/* --- DIREITA: FORMULÁRIOS --- */}
      <div className="flex items-center justify-center p-6 lg:p-10 bg-muted/30">
        <div className="mx-auto w-full max-w-[400px] space-y-8">
          <div className="flex flex-col space-y-2 text-center">
            <div className="lg:hidden flex justify-center mb-4">
              <div className="bg-primary p-2 rounded-xl text-primary-foreground">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Acesse sua conta
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerencie as finanças da sua família em um só lugar.
            </p>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
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
                  className="w-full shadow-sm"
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

                <div className="text-xs text-muted-foreground space-y-2 py-2">
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-primary" /> Gestão de
                    time familiar
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-primary" /> Leitura de
                    recibos com IA
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full shadow-sm"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  ) : (
                    "Criar Conta Grátis"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-center text-xs text-muted-foreground px-8">
            Ao continuar, você concorda com nossos{" "}
            <Link href="#" className="underline hover:text-foreground">
              Termos de Serviço
            </Link>{" "}
            e{" "}
            <Link href="#" className="underline hover:text-foreground">
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
