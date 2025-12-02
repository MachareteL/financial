"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
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
  Menu,
  X,
  Users,
  PieChart,
  CheckCircle2,
  Scan,
  History,
  Calculator,
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
            <Link
              href="/#features"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Funcionalidades
            </Link>
            <Link
              href="/#method"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              O Método
            </Link>
            <Link
              href="/#pricing"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Planos
            </Link>
            <Link
              href="/blog"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Blog
            </Link>
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
              <Link
                href="/#features"
                className="text-base font-medium text-muted-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Funcionalidades
              </Link>
              <Link
                href="/#method"
                className="text-base font-medium text-muted-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                O Método
              </Link>
              <Link
                href="/#pricing"
                className="text-base font-medium text-muted-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Planos
              </Link>
              <Link
                href="/blog"
                className="text-base font-medium text-muted-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
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
            <div className="lg:w-1/2 animate-in slide-in-from-bottom-10 fade-in duration-700">
              <Badge
                variant="secondary"
                className="mb-6 px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
              >
                <Sparkles className="w-3.5 h-3.5 mr-2 inline-block" />
                Finanças Inteligentes com IA
              </Badge>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-6">
                O fim das planilhas que vocês{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-chart-2">
                  sempre esquecem
                </span>{" "}
                de preencher.
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Construam a vida financeira a dois sem o trabalho braçal. A IA
                do Lemon organiza os gastos automaticamente para vocês focarem
                no futuro.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all group"
                  onClick={handleGetStarted}
                >
                  Começar a construir juntos
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg border-2"
                  onClick={() => {
                    document
                      .getElementById("pain")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Entender o problema
                </Button>
              </div>
              <div className="mt-6 flex items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-primary" />
                  </div>
                  <span>Sem cartão necessário</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-primary" />
                  </div>
                  <span>Teste grátis</span>
                </div>
              </div>
            </div>

            {/* Visual Mockup Hero */}
            <div className="mt-16 lg:mt-0 lg:w-1/2 relative perspective-1000 animate-in slide-in-from-right-10 fade-in duration-1000 delay-200">
              {/* Card Flutuante Principal */}
              <div className="relative z-10 bg-card rounded-3xl shadow-2xl border border-border p-6 transform transition-transform hover:scale-[1.02] duration-500">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      Meta da Casa Própria
                    </p>
                    <h3 className="text-4xl font-bold tracking-tight mt-1">
                      R$ 150.000,00
                    </h3>
                    <div className="w-full bg-secondary h-2 rounded-full mt-2 overflow-hidden">
                      <div className="bg-primary h-full rounded-full w-[35%]"></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      35% alcançado
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="text-primary h-6 w-6" />
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Simulação de Scan */}
                  <div className="flex items-center gap-4 bg-secondary/50 p-4 rounded-2xl border border-border/50 backdrop-blur-sm">
                    <div className="bg-primary/20 p-2 rounded-xl text-primary">
                      <Scan className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Lendo recibo...</p>
                      <p className="text-xs text-muted-foreground">
                        Identificando itens e valores
                      </p>
                    </div>
                    <div className="ml-auto">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
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
                          <p className="text-sm font-medium">
                            Jantar de Comemoração
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Ontem • Lazer
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold">-R$ 240,00</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Elementos Decorativos de Fundo */}
              <div className="absolute -top-10 -right-10 w-full h-full bg-gradient-to-br from-primary to-green-400 rounded-3xl -z-10 opacity-20 blur-2xl transform rotate-6"></div>
            </div>
          </div>
        </section>

        {/* --- PAIN SECTION ("O Susto") --- */}
        <section
          id="pain"
          className="relative py-24 bg-muted/30 overflow-hidden"
        >
          {/* Wall Light Effect */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-primary/20 blur-[120px] rounded-t-full pointer-events-none" />

          <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
              Aquele susto na fatura do cartão acontece porque vocês estão{" "}
              <span className="text-destructive">voando às cegas</span>.
            </h2>
            <div className="text-xl text-muted-foreground leading-relaxed">
              Vocês combinam de anotar, a rotina atropela, e a planilha fica
              esquecida por semanas. O resultado? Vocês só descobrem que
              gastaram demais quando a fatura chega. <br />
              <br />
              <strong className="text-foreground text-3xl md:text-4xl font-extrabold tracking-tight block mt-8">
                O Lemon acende a luz.
              </strong>
            </div>
          </div>
        </section>

        {/* --- HOW IT WORKS ("Como Funciona") --- */}
        <section className="py-24 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Três passos para a paz financeira
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Você não precisa ser um expert em finanças. O Lemon guia vocês.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Linha conectora (Desktop) */}
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -z-10" />

              {/* Passo 1 */}
              <div className="relative flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-background border-4 border-muted rounded-full flex items-center justify-center mb-6 shadow-sm z-10">
                  <span className="text-3xl font-bold text-muted-foreground">
                    1
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3">Crie seu Espaço</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Convide seu parceiro(a). O Lemon cria um ambiente seguro para
                  vocês unirem as visões.
                </p>
              </div>

              {/* Passo 2 */}
              <div className="relative flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-background border-4 border-primary rounded-full flex items-center justify-center mb-6 shadow-lg shadow-primary/20 z-10">
                  <span className="text-3xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Defina o Orçamento</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Insira a renda do casal. Nossa IA sugere automaticamente a
                  divisão ideal 50/30/20 para suas Necessidades, Desejos e
                  Futuro.
                </p>
              </div>

              {/* Passo 3 */}
              <div className="relative flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-background border-4 border-muted rounded-full flex items-center justify-center mb-6 shadow-sm z-10">
                  <span className="text-3xl font-bold text-muted-foreground">
                    3
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3">Viva (e registre)</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Esqueça a digitação. Gastou? Tire uma foto do recibo e o Lemon
                  preenche automaticamente.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- BENEFITS SECTION (Bento Grid) --- */}
        <section id="features" className="py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Construído para o Casal Moderno
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Ferramentas que se adaptam à sua rotina, não o contrário.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card IA - Grande */}
              <Card className="md:col-span-2 bg-card border-border/50 hover:border-primary/50 transition-all hover:shadow-lg group overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Scan className="w-32 h-32 text-primary" />
                </div>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Scan className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Zero Digitação</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-lg">
                    Foto, enviou, tá salvo. Nossa IA lê cupons fiscais,
                    identifica categorias e divide os valores automaticamente.
                    Esqueça a digitação manual de cada cafezinho.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Card Visão Longo Prazo */}
              <Card className="bg-card border-border/50 hover:border-primary/50 transition-all hover:shadow-lg group">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <History className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle>Histórico Unificado</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Vejam o patrimônio do casal crescendo mês a mês. Um feed
                    único de todas as finanças da casa.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Card Método 50/30/20 */}
              <Card className="bg-card border-border/50 hover:border-primary/50 transition-all hover:shadow-lg group">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Calculator className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>Orçamento Automático</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Aplicamos o método 50/30/20 automaticamente. Saibam
                    exatamente quanto podem gastar sem culpa em lazer.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Card Analytics */}
              <Card className="md:col-span-2 bg-card border-border/50 hover:border-primary/50 transition-all hover:shadow-lg group overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <PieChart className="w-32 h-32 text-primary" />
                </div>
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <PieChart className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <CardTitle className="text-2xl">Clareza Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-lg">
                    Gráficos que mostram a verdade. Entenda para onde está indo
                    o dinheiro e ajuste a rota antes do mês acabar.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* --- PRICING --- */}
        <section id="pricing" className="py-24 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Investimento no seu futuro
              </h2>
              <p className="text-lg text-muted-foreground">
                Menos que um jantar fora para organizar a vida financeira do ano
                todo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Plano Free */}
              <Card className="border-border shadow-sm hover:shadow-md transition-all">
                <CardHeader>
                  <CardTitle className="text-2xl">Starter</CardTitle>
                  <CardDescription>
                    Para quem está começando a organizar.
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
                      Lançamentos manuais
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
                  RECOMENDADO
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    Pro
                    <Sparkles className="w-5 h-5 text-primary fill-current" />
                  </CardTitle>
                  <CardDescription>Para o Casal Construtor.</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">R$ 29,90</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" /> Acesso
                      para o Casal (2 contas)
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
              Comecem a construir hoje.
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              O futuro que vocês querem depende da organização que vocês têm
              hoje.
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
            <Link
              href="/terms"
              className="hover:text-primary transition-colors"
            >
              Termos
            </Link>
            <Link
              href="/privacy"
              className="hover:text-primary transition-colors"
            >
              Privacidade
            </Link>
            <a href="#" className="hover:text-primary transition-colors">
              Contato
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
