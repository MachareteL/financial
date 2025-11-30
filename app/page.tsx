"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/app/auth/auth-provider";
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  Zap,
  Menu,
  X,
  Users,
  Smartphone,
  PieChart,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";

export default function LandingPage() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useTheme();

  const handleGetStarted = () => {
    if (session) {
      router.push("/dashboard");
    } else {
      router.push("/auth");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">Lemon</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Features
            </a>
            <a
              href="#method"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              O Método
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Planos
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <Button onClick={() => router.push("/dashboard")}>
                Ir para o App
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => router.push("/auth")}>
                  Login
                </Button>
                <Button onClick={() => router.push("/auth")}>
                  Começar Agora
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-muted-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 py-4 shadow-lg">
            <div className="flex flex-col space-y-4">
              <a
                href="#features"
                className="text-base font-medium text-muted-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#method"
                className="text-base font-medium text-muted-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                O Método
              </a>
              <a
                href="#pricing"
                className="text-base font-medium text-muted-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Planos
              </a>
              <div className="pt-2 flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push("/auth")}
                  className="w-full"
                >
                  Login
                </Button>
                <Button onClick={handleGetStarted} className="w-full">
                  Começar Agora
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* --- HERO SECTION --- */}
        <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
            <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl -z-10 opacity-50 dark:opacity-20" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-3xl -z-10 opacity-50 dark:opacity-20" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center lg:text-left lg:flex lg:items-center lg:gap-16">
            {/* Texto Hero */}
            <div className="lg:w-1/2">
              <Badge
                variant="secondary"
                className="mb-6 px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
              >
                <Sparkles className="w-3.5 h-3.5 mr-2 inline-block" />
                Finanças Inteligentes com IA
              </Badge>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-6">
                Domine seu dinheiro. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-400">
                  Sem esforço.
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                O Lemon é o sistema operacional financeiro para quem quer viver
                o futuro. Automatize gastos, sincronize com seu parceiro e veja
                seu patrimônio crescer com insights de IA.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg shadow-lg shadow-primary/20"
                  onClick={handleGetStarted}
                >
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg"
                >
                  Ver Demo
                </Button>
              </div>
              <div className="mt-8 flex items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4 text-primary" />
                  <span>Criptografia de ponta</span>
                </div>
                <div className="flex items-center gap-2">
                  <ZapIcon className="w-4 h-4 text-primary" />
                  <span>Setup em 2 min</span>
                </div>
              </div>
            </div>

            {/* Visual Mockup Hero */}
            <div className="mt-16 lg:mt-0 lg:w-1/2 relative perspective-1000">
              {/* Card Flutuante Principal */}
              <div className="relative z-10 bg-card rounded-3xl shadow-2xl border border-border p-6 transform transition-transform hover:scale-[1.02] duration-500">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      Patrimônio Total
                    </p>
                    <h3 className="text-4xl font-bold tracking-tight mt-1">
                      R$ 42.850,00
                    </h3>
                  </div>
                  <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="text-primary h-6 w-6" />
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Notificação Simulada */}
                  <div className="flex items-start gap-4 bg-secondary/50 p-4 rounded-2xl border border-border/50 backdrop-blur-sm">
                    <div className="bg-primary p-2 rounded-xl shadow-sm">
                      <Sparkles className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Lemon AI Insight</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Detectei uma economia de{" "}
                        <span className="text-primary font-bold">R$ 340</span>{" "}
                        em assinaturas não utilizadas este mês. Deseja investir
                        esse valor?
                      </p>
                    </div>
                  </div>

                  {/* Lista de Gastos Recentes */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center p-3 hover:bg-muted/50 rounded-xl transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Jantar de Sexta</p>
                          <p className="text-xs text-muted-foreground">
                            Ontem • Dividido
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold">-R$ 180,00</span>
                    </div>
                    <div className="flex justify-between items-center p-3 hover:bg-muted/50 rounded-xl transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Spotify Premium</p>
                          <p className="text-xs text-muted-foreground">
                            Hoje • Recorrente
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold">-R$ 21,90</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Elementos Decorativos de Fundo */}
              <div className="absolute -top-10 -right-10 w-full h-full bg-gradient-to-br from-primary to-green-400 rounded-3xl -z-10 opacity-20 blur-2xl transform rotate-6"></div>
            </div>
          </div>
        </section>

        {/* --- FEATURES --- */}
        <section id="features" className="py-24 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Tecnologia que trabalha por você
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Esqueça as planilhas manuais. O Lemon usa automação e design
                inteligente para simplificar sua vida financeira.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-card border-border/50 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <Smartphone className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Scan & Go</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Aponte a câmera para qualquer nota fiscal. Nossa IA extrai
                    todos os dados, categoriza e arquiva em segundos. Zero
                    digitação.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/50 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle>Multiplayer Real</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Gerencie finanças em casal ou república como um time pro.
                    Saldos compartilhados, metas conjuntas e privacidade onde
                    precisa.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/50 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-4">
                    <PieChart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>Analytics Profundo</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Visualize para onde vai cada centavo com gráficos
                    interativos. Entenda seus hábitos e otimize seu fluxo de
                    caixa.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* --- METHOD --- */}
        <section id="method" className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:flex lg:items-center lg:gap-20">
              <div className="lg:w-1/2 mb-12 lg:mb-0">
                <div className="relative aspect-square max-w-md mx-auto">
                  {/* Abstract Chart Visualization */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-full blur-3xl" />
                  <div className="relative z-10 bg-card border border-border rounded-3xl p-8 shadow-2xl h-full flex flex-col justify-center items-center text-center">
                    <div className="w-48 h-48 rounded-full border-[24px] border-primary border-r-purple-500 border-b-blue-500 transform rotate-45 mb-8" />
                    <h3 className="text-2xl font-bold mb-2">Método 50/30/20</h3>
                    <p className="text-muted-foreground">
                      A fórmula comprovada para o equilíbrio financeiro,
                      integrada nativamente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:w-1/2">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                  Não é só um app. <br />É um framework de riqueza.
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  O Lemon aplica automaticamente a regra 50/30/20 ao seu
                  orçamento. Cada real que entra já tem um destino certo.
                </p>

                <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                    <div className="mt-1 h-8 w-8 flex-none rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                      50
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">
                        Necessidades
                      </h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        Custos fixos e essenciais para viver.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="mt-1 h-8 w-8 flex-none rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
                      30
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">Desejos</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        Estilo de vida, lazer e diversão.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="mt-1 h-8 w-8 flex-none rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                      20
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">Futuro</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        Investimentos e liberdade financeira.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- PRICING --- */}
        <section id="pricing" className="py-24 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Simples. Transparente.
              </h2>
              <p className="text-lg text-muted-foreground">
                Comece grátis e faça o upgrade quando precisar de mais poder.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Plano Free */}
              <Card className="border-border shadow-sm hover:shadow-md transition-all">
                <CardHeader>
                  <CardTitle className="text-2xl">Starter</CardTitle>
                  <CardDescription>
                    Para organização individual.
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">R$ 0</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" /> 1
                      Usuário
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />{" "}
                      Lançamentos manuais ilimitados
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" /> 5 Scans
                      com IA / mês
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/auth")}
                  >
                    Começar Grátis
                  </Button>
                </CardFooter>
              </Card>

              {/* Plano Pro */}
              <Card className="border-primary shadow-2xl relative overflow-hidden bg-card transform md:scale-105 z-10">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                  POPULAR
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    Pro
                    <Sparkles className="w-5 h-5 text-primary fill-current" />
                  </CardTitle>
                  <CardDescription>Para casais e power users.</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">R$ 29,90</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" /> Membros
                      Ilimitados
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" /> Scans
                      com IA Ilimitados
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />{" "}
                      Analytics Avançado
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" /> Metas
                      Compartilhadas
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => router.push("/auth")}
                  >
                    Testar Pro Grátis
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* --- CTA FINAL --- */}
        <section className="py-24 border-t border-border">
          <div className="mx-auto max-w-4xl text-center px-4">
            <h2 className="text-3xl font-bold tracking-tight mb-6">
              Pronto para assumir o controle?
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Junte-se a milhares de pessoas que estão construindo riqueza com o
              Lemon.
            </p>
            <Button
              size="lg"
              className="h-14 px-12 text-lg shadow-xl"
              onClick={handleGetStarted}
            >
              Criar Conta Grátis
            </Button>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-background py-12 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold">Lemon</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2025 Lemon Financial. Todos os direitos reservados.
          </div>
          <div className="flex gap-6 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">
              Termos
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Privacidade
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Contato
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ShieldCheckIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ZapIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14H4Z" />
    </svg>
  );
}
