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
  CheckCircle,
  Heart,
  MessageCircle,
  PieChart,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

export default function LandingPage() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGetStarted = () => {
    if (session) {
      router.push("/dashboard");
    } else {
      router.push("/auth");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100">
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Finanças<span className="text-blue-600">EmPar</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#metodo"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              O Método
            </a>
            <a
              href="#funcionalidades"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              Funcionalidades
            </a>
            <a
              href="#depoimentos"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              Depoimentos
            </a>
            <a
              href="#precos"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
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
                  Entrar
                </Button>
                <Button onClick={() => router.push("/auth")}>
                  Começar Grátis
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-slate-600"
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
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 shadow-lg">
            <div className="flex flex-col space-y-4">
              <a
                href="#metodo"
                className="text-base font-medium text-slate-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                O Método
              </a>
              <a
                href="#funcionalidades"
                className="text-base font-medium text-slate-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Funcionalidades
              </a>
              <a
                href="#precos"
                className="text-base font-medium text-slate-600"
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
                  Entrar
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
            <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-100/50 rounded-full blur-3xl -z-10" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center lg:text-left lg:flex lg:items-center lg:gap-16">
            {/* Texto Hero */}
            <div className="lg:w-1/2">
              <Badge
                variant="secondary"
                className="mb-6 px-4 py-1.5 text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
              >
                <Sparkles className="w-3.5 h-3.5 mr-2 inline-block text-blue-600" />
                Novo: Leitura de notas fiscais com IA
              </Badge>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl mb-6">
                O fim das brigas por dinheiro e das{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  planilhas chatas.
                </span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                O primeiro sistema financeiro inteligente feito para a vida a
                dois (e em família). Junte as finanças, automatize os registros
                com IA e realize sonhos, sem perder a individualidade.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg shadow-lg shadow-blue-600/20"
                  onClick={handleGetStarted}
                >
                  Começar Grátis Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg"
                >
                  Ver como funciona
                </Button>
              </div>
              <p className="mt-4 text-sm text-slate-500 flex items-center justify-center lg:justify-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" /> Sem cartão de
                crédito necessário
                <span className="mx-2">•</span>
                <CheckCircle className="w-4 h-4 text-green-500" /> Cancele
                quando quiser
              </p>
            </div>

            {/* Visual Mockup Hero */}
            <div className="mt-16 lg:mt-0 lg:w-1/2 relative perspective-1000">
              {/* Card Flutuante Principal */}
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 transform transition-transform hover:scale-[1.02] duration-500">
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">
                      Saldo da Família
                    </p>
                    <h3 className="text-3xl font-bold text-slate-900">
                      R$ 12.450,00
                    </h3>
                  </div>
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="text-green-600 h-6 w-6" />
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Notificação Simulada */}
                  <div className="flex items-start gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <div className="bg-blue-600 p-1.5 rounded-full mt-0.5">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-900">
                        Automação Inteligente
                      </p>
                      <p className="text-xs text-blue-700 mt-0.5">
                        Receita de R$ 5.000 detectada.
                        <br />
                        <span className="font-bold">R$ 1.000 (20%)</span> já foi
                        separado para a "Viagem Disney ✈️".
                      </p>
                    </div>
                  </div>

                  {/* Lista de Gastos Recentes */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Jantar Fora</p>
                          <p className="text-xs text-slate-500">
                            Ontem • Ana pagou
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        -R$ 180,00
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Internet Fibra</p>
                          <p className="text-xs text-slate-500">
                            Hoje • Recorrente
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        -R$ 120,00
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Elementos Decorativos de Fundo */}
              <div className="absolute -top-6 -right-6 w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl -z-10 opacity-10 transform rotate-3"></div>
              <div className="absolute -bottom-8 -left-8 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce-slow">
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">
                    Meta Atingida
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    Fundo de Emergência 🔒
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- PAIN POINTS (PROBLEMA) --- */}
        <section className="py-20 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                Gerenciar o dinheiro da casa não deveria ser um segundo emprego.
              </h2>
              <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
                Você sente que trabalha muito, mas o dinheiro desaparece? A falta
                de um sistema claro gera ansiedade e conflitos desnecessários.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                    <MessageCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <CardTitle className="text-xl">"Quem pagou o quê?"</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Chega de cobrar PIX do parceiro no final do mês ou esquecer
                    quem pagou a conta de luz. Tenha tudo centralizado e
                    transparente em um só lugar.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                    <PieChart className="w-6 h-6 text-slate-600" />
                  </div>
                  <CardTitle className="text-xl">
                    O "Buraco Negro" dos Gastos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    O dinheiro entra e some? Saiba exatamente quanto está indo
                    para iFood, Uber e "blusinhas", sem precisar somar notinha
                    por notinha manualmente.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                    <ArrowRight className="w-6 h-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl">
                    Planilhas Abandonadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Você começa empolgado e para na segunda semana porque dá
                    muito trabalho. Nosso app faz o trabalho pesado de
                    organização para você.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* --- SOLUTION (MÉTODO 50/30/20) --- */}
        <section id="metodo" className="py-20 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:flex lg:items-center lg:gap-16">
              <div className="lg:w-1/2 mb-12 lg:mb-0 order-2 lg:order-1">
                <div className="relative">
                  {/* Gráfico Visual CSS */}
                  <div className="aspect-square max-w-md mx-auto relative">
                    <div className="absolute inset-0 rounded-full border-[40px] border-blue-100"></div>
                    <div
                      className="absolute inset-0 rounded-full border-[40px] border-transparent border-t-green-500 border-r-green-500 transform -rotate-45"
                      style={{ clipPath: "polygon(50% 50%, 0 0, 100% 0)" }}
                    ></div>
                    {/* Representação simplificada visual */}
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-4xl font-bold text-slate-800">
                        O Método
                      </span>
                      <span className="text-sm text-slate-500 font-medium uppercase tracking-wider">
                        Automático
                      </span>
                    </div>
                    
                    {/* Labels Flutuantes */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 bg-white shadow-lg px-4 py-2 rounded-full border border-slate-100">
                      <span className="font-bold text-green-600">
                        50% Necessidades
                      </span>
                    </div>
                    <div className="absolute bottom-1/4 right-0 translate-x-6 bg-white shadow-lg px-4 py-2 rounded-full border border-slate-100">
                      <span className="font-bold text-amber-500">
                        30% Desejos
                      </span>
                    </div>
                    <div className="absolute bottom-1/4 left-0 -translate-x-6 bg-white shadow-lg px-4 py-2 rounded-full border border-slate-100">
                      <span className="font-bold text-blue-600">
                        20% Futuro
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:w-1/2 order-1 lg:order-2">
                <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl mb-6">
                  Mais que um app, um <br />
                  <span className="text-blue-600">método de prosperidade.</span>
                </h2>
                <p className="text-lg text-slate-600 mb-8">
                  Não adianta apenas anotar. É preciso dar destino ao dinheiro.
                  Nosso sistema já vem configurado com a regra de ouro das
                  finanças, ajustando-se automaticamente à sua realidade.
                </p>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="mt-1 h-8 w-8 flex-none rounded-full bg-green-100 flex items-center justify-center">
                      <span className="font-bold text-green-700">50</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">
                        Necessidades Essenciais
                      </h4>
                      <p className="text-slate-600 text-sm">
                        Aluguel, mercado, contas. O essencial para a casa rodar
                        sem estresse.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="mt-1 h-8 w-8 flex-none rounded-full bg-amber-100 flex items-center justify-center">
                      <span className="font-bold text-amber-700">30</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">
                        Desejos & Estilo de Vida
                      </h4>
                      <p className="text-slate-600 text-sm">
                        Jantares, lazer, hobbies. Porque a vida é para ser
                        vivida (com responsabilidade).
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="mt-1 h-8 w-8 flex-none rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="font-bold text-blue-700">20</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">
                        Futuro & Sonhos
                      </h4>
                      <p className="text-slate-600 text-sm">
                        Investimentos, aposentadoria e aquela viagem dos sonhos.
                        Pague-se primeiro.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- FEATURES (O UAU) --- */}
        <section id="funcionalidades" className="py-20 bg-slate-900 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="bg-blue-600 hover:bg-blue-700 border-none text-white mb-4">
                Tecnologia de Ponta
              </Badge>
              <h2 className="text-3xl font-bold sm:text-4xl">
                Funcionalidades que eliminam o trabalho chato.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-blue-500 transition-colors group">
                <div className="w-12 h-12 bg-blue-900/50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Adeus Digitação</h3>
                <p className="text-slate-400 leading-relaxed">
                  Tirou, tá salvo. Nossa Inteligência Artificial lê a foto dos
                  seus recibos, extrai o valor, a data e categoriza
                  automaticamente em segundos.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-purple-500 transition-colors group">
                <div className="w-12 h-12 bg-purple-900/50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Modo Multiplayer</h3>
                <p className="text-slate-400 leading-relaxed">
                  Crie seu Time. Convide quem você ama e gerencie o orçamento
                  doméstico com permissões inteligentes. O que é seu, é seu. O
                  que é nosso, é transparente.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-green-500 transition-colors group">
                <div className="w-12 h-12 bg-green-900/50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Controle Total</h3>
                <p className="text-slate-400 leading-relaxed">
                  Painéis visuais que mostram a saúde financeira em tempo real.
                  Saiba se você pode gastar ou se é hora de segurar a onda,
                  antes de o mês acabar.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- TESTIMONIALS (PROVA SOCIAL) --- */}
        <section id="depoimentos" className="py-20 bg-blue-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
              Casais que pararam de brigar e começaram a realizar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-white border-none shadow-sm p-6">
                <div className="flex gap-1 mb-4 text-amber-400">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Sparkles key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-slate-600 italic mb-6">
                  "Antes a gente brigava todo final de mês tentando entender
                  quem gastou o quê. Agora a gente abre o app, vê que a meta de
                  'Desejos' foi atingida e vai comemorar sem culpa. Mudou nosso
                  casamento."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                    MJ
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Mariana & João</p>
                    <p className="text-xs text-slate-500">
                      Usuários há 6 meses
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="bg-white border-none shadow-sm p-6">
                <div className="flex gap-1 mb-4 text-amber-400">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Sparkles key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-slate-600 italic mb-6">
                  "Eu odiava planilhas. O fato de poder tirar foto da nota
                  fiscal e ele já saber que foi 'Mercado' é mágico. Conseguimos
                  juntar para nossa viagem em tempo recorde."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                    PC
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Pedro Costa</p>
                    <p className="text-xs text-slate-500">Recém-casado</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* --- PRICING --- */}
        <section id="precos" className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900">
                Invista no seu futuro por menos de uma pizza
              </h2>
              <p className="mt-4 text-slate-600">
                Escolha o plano ideal para o seu momento de vida.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Plano Free */}
              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
                <CardHeader>
                  <CardTitle className="text-2xl">Essencial</CardTitle>
                  <CardDescription>
                    Para quem está começando a se organizar.
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-slate-900">
                      R$ 0
                    </span>
                    <span className="text-slate-500">/mês</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" /> 1
                      Usuário
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" /> Método
                      50/30/20 Básico
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />{" "}
                      Lançamentos manuais ilimitados
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" /> 5
                      Leituras com IA / mês
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

              {/* Plano Pro - Destaque */}
              <Card className="border-blue-600 shadow-xl relative overflow-hidden bg-slate-900 text-white transform scale-105 z-10">
                <div className="absolute top-0 right-0 bg-blue-600 text-xs font-bold px-3 py-1 rounded-bl-lg">
                  MAIS POPULAR
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    Casal Pro <Heart className="w-5 h-5 text-red-500 fill-current" />
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    O poder total para construir riqueza juntos.
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">R$ 29,90</span>
                    <span className="text-slate-400">/mês</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-slate-300">
                    <li className="flex items-center gap-2 text-white">
                      <CheckCircle className="w-4 h-4 text-green-400" /> Membros
                      Ilimitados (Convide seu amor)
                    </li>
                    <li className="flex items-center gap-2 text-white">
                      <CheckCircle className="w-4 h-4 text-green-400" /> Leitura
                      com IA Ilimitada 📸
                    </li>
                    <li className="flex items-center gap-2 text-white">
                      <CheckCircle className="w-4 h-4 text-green-400" />{" "}
                      Personalize as Regras (%)
                    </li>
                    <li className="flex items-center gap-2 text-white">
                      <CheckCircle className="w-4 h-4 text-green-400" />{" "}
                      Gráficos Avançados
                    </li>
                    <li className="flex items-center gap-2 text-white">
                      <CheckCircle className="w-4 h-4 text-green-400" />{" "}
                      Metas de Sonhos Compartilhados
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-700 border-none text-white"
                    onClick={() => router.push("/auth")}
                  >
                    Testar Premium Grátis
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* --- CTA FINAL --- */}
        <section className="py-20 bg-slate-50 border-t border-slate-200">
          <div className="mx-auto max-w-4xl text-center px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              Comece hoje a construir o futuro que vocês sonham.
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Junte-se a milhares de famílias que trocaram o estresse financeiro
              pela paz de espírito.
            </p>
            <Button
              size="lg"
              className="h-14 px-12 text-lg shadow-xl"
              onClick={handleGetStarted}
            >
              Criar Minha Conta Agora
            </Button>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-white py-12 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-bold text-slate-900">
              FinançasEmPar
            </span>
          </div>
          <div className="text-sm text-slate-500">
            © 2025 FinançasEmPar. Feito com <span className="text-red-500">❤️</span> para famílias que sonham grande.
          </div>
          <div className="flex gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-blue-600">Termos</a>
            <a href="#" className="hover:text-blue-600">Privacidade</a>
            <a href="#" className="hover:text-blue-600">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
}