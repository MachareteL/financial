"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { TrendingUp, Users, PieChart, Target, BarChart3, Wallet, Calendar, ArrowRight, CheckCircle } from "lucide-react"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard")
    } else {
      router.push("/auth")
    }
  }

  const features = [
    {
      icon: <PieChart className="h-8 w-8 text-blue-600" />,
      title: "Dashboards Inteligentes",
      description: "Visualize seus gastos com gráficos interativos e relatórios detalhados em tempo real.",
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: "Gestão Familiar",
      description: "Organize as finanças de toda a família com controle de permissões e colaboração.",
    },
    {
      icon: <Target className="h-8 w-8 text-purple-600" />,
      title: "Método 50/30/20",
      description: "Implemente automaticamente a regra 50/30/20 para necessidades, desejos e poupança.",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-orange-600" />,
      title: "Análises Avançadas",
      description: "Acompanhe tendências, compare períodos e receba alertas inteligentes sobre seus gastos.",
    },
    {
      icon: <Wallet className="h-8 w-8 text-red-600" />,
      title: "Controle de Gastos",
      description: "Registre gastos únicos, recorrentes ou parcelados com categorização automática.",
    },
    {
      icon: <Calendar className="h-8 w-8 text-indigo-600" />,
      title: "Planejamento Mensal",
      description: "Defina orçamentos mensais e acompanhe o progresso das suas metas financeiras.",
    },
  ]

  const benefits = [
    "Controle total das finanças pessoais e familiares",
    "Dashboards visuais com gráficos interativos",
    "Categorização inteligente de gastos",
    "Alertas automáticos de orçamento",
    "Gestão de gastos recorrentes e parcelados",
    "Relatórios detalhados por período",
    "Sistema de permissões para família",
    "Interface responsiva para todos os dispositivos",
  ]

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Finanças Familiares</span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Button onClick={() => router.push("/dashboard")}>Ir ao Dashboard</Button>
                </div>
              ) : (
                <Button onClick={() => router.push("/auth")}>Entrar</Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Organize suas
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}
              Finanças{" "}
            </span>
            em Família
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A plataforma completa para controle financeiro pessoal e familiar. Dashboards inteligentes, método 50/30/20
            e gestão colaborativa em um só lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-3">
              {user ? "Ir ao Dashboard" : "Começar Agora"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            {!user && (
              <Button size="lg" variant="outline" onClick={() => router.push("/auth")} className="text-lg px-8 py-3">
                Fazer Login
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Funcionalidades Principais</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tudo que você precisa para ter controle total das suas finanças
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Por que escolher nossa plataforma?</h2>
              <p className="text-xl text-blue-100 mb-8">
                Desenvolvida especialmente para famílias brasileiras que querem ter controle total de suas finanças de
                forma simples e eficiente.
              </p>
              <div className="space-y-4">
                {benefits.slice(0, 4).map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                    <span className="text-white">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {benefits.slice(4).map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                  <span className="text-white">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">50/30/20</div>
              <div className="text-gray-600">Método comprovado de organização financeira</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-gray-600">Controle sobre seus gastos e receitas</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">∞</div>
              <div className="text-gray-600">Membros da família podem participar</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Pronto para organizar suas finanças?</h2>
          <p className="text-xl text-gray-600 mb-8">
            {user
              ? "Acesse seu dashboard e continue gerenciando suas finanças familiares."
              : "Crie sua conta gratuita e comece a ter controle total das suas finanças hoje mesmo."}
          </p>
          <Button size="lg" onClick={handleGetStarted} className="text-lg px-12 py-4">
            {user ? "Acessar Dashboard" : "Criar Conta Gratuita"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold">Finanças Familiares</span>
              </div>
              <p className="text-gray-400">A plataforma completa para organização financeira pessoal e familiar.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Funcionalidades</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Dashboard Interativo</li>
                <li>Gestão Familiar</li>
                <li>Método 50/30/20</li>
                <li>Relatórios Detalhados</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Recursos</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Gastos Recorrentes</li>
                <li>Controle de Parcelas</li>
                <li>Alertas Inteligentes</li>
                <li>Interface Responsiva</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Finanças Familiares. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
