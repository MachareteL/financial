import type { Metadata } from "next";
import {
  ShieldAlert,
  Bot,
  CreditCard,
  UserCog,
  Scale,
  FileText,
  AlertTriangle,
  Gavel,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Termos de Uso | Lemon",
  description: "Termos de uso e condições do serviço Lemon.",
};

export default function TermsPage() {
  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <Badge
          variant="outline"
          className="px-4 py-1 border-primary/20 bg-primary/5 text-primary"
        >
          Última atualização: {new Date().toLocaleDateString("pt-BR")}
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          Termos de Uso
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Bem-vindo ao Lemon. Aqui explicamos de forma clara as regras para usar
          nossa plataforma.
        </p>
      </div>

      {/* Critical Disclaimer - High Visibility */}
      <Card className="border-yellow-500/50 bg-yellow-500/5 dark:bg-yellow-500/10">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 mb-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-bold uppercase tracking-wider text-xs">
              Como funcionamos
            </span>
          </div>
          <CardTitle className="text-xl">
            Ferramenta de Apoio à Decisão
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground leading-relaxed space-y-2">
          <p>
            O Lemon usa tecnologia para analisar seus dados e{" "}
            <strong>sugerir onde você pode economizar</strong>. Para que nossa
            relação seja transparente, é importante alinhar que:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>
              Nossos insights são <strong>informativos e educacionais</strong>,
              gerados por algoritmos.
            </li>
            <li>
              O serviço{" "}
              <strong>não é uma consultoria financeira regulamentada</strong>{" "}
              (como a de um gestor CVM). Nós damos as ferramentas, mas a
              estratégia é sua.
            </li>
            <li>
              Você é o único responsável por suas decisões de gastos e
              investimentos.
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Introduction */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-colors">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <CardTitle>1. Aceitação e Vinculação</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            A utilização da plataforma Lemon implica na{" "}
            <strong>aceitação integral e irrestrita</strong> destes Termos de
            Uso. Este documento possui força de contrato de adesão. Caso não
            concorde com as disposições aqui estabelecidas, o Usuário deverá
            abster-se de utilizar o serviço.
          </CardContent>
        </Card>

        {/* 2. AI Usage */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-colors">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 text-purple-500">
              <Bot className="h-5 w-5" />
            </div>
            <CardTitle>2. Uso de Inteligência Artificial</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            A plataforma integra{" "}
            <strong>Modelos de Linguagem Natural (LLMs)</strong> para
            processamento de dados. O Usuário reconhece a natureza
            probabilística de tais tecnologias e assume o dever de validar a
            exatidão das informações extraídas (ex: dados fiscais) antes de sua
            efetivação.
          </CardContent>
        </Card>

        {/* 3. Subscriptions */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-colors">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-4 text-green-500">
              <CreditCard className="h-5 w-5" />
            </div>
            <CardTitle>3. Assinaturas e Faturamento</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>
              <strong>Renovação Automática:</strong> A assinatura renova-se
              automaticamente ao término de cada ciclo, mantendo-se as condições
              vigentes, salvo cancelamento prévio.
            </p>
            <p>
              <strong>Reajuste de Preços:</strong> O Lemon reserva-se o direito
              de atualizar os valores dos planos, mediante{" "}
              <strong>aviso prévio de 30 (trinta) dias</strong>.
            </p>
            <p>
              <strong>Política de Cancelamento:</strong> O cancelamento pode ser
              efetuado a qualquer tempo. Em conformidade com o Código de Defesa
              do Consumidor, garante-se o direito de arrependimento em até 7
              dias da contratação inicial.
            </p>
          </CardContent>
        </Card>

        {/* 4. User Responsibilities */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-colors">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 text-blue-500">
              <UserCog className="h-5 w-5" />
            </div>
            <CardTitle>4. Segurança e Deveres</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            O Usuário é o único responsável pela guarda de suas credenciais de
            acesso. Compromete-se a utilizar senhas fortes e a não compartilhar
            seu login. Qualquer atividade realizada através de sua conta será
            presumida como de sua autoria e responsabilidade.
          </CardContent>
        </Card>
      </div>

      {/* Legal & Liability - Full Width */}
      <div className="space-y-6">
        <Card className="bg-muted/30 border-none">
          <CardHeader>
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">
                5. Limitação de Responsabilidade
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            Trabalhamos duro para o Lemon estar sempre disponível e seguro, mas
            imprevistos acontecem. Não nos responsabilizamos por danos indiretos
            (como perda de lucros) decorrentes do uso do serviço, dentro dos
            limites da lei.
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border-none">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Scale className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">6. Lei Aplicável</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            Estes termos seguem as leis do Brasil. Qualquer disputa será
            resolvida no foro da Comarca de São Paulo/SP.
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border-none">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Gavel className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">7. Geral</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            Podemos atualizar estes termos conforme o Lemon evolui. Se a mudança
            for grande, avisaremos você. Continuar usando o app significa que
            você aceita as novidades.
          </CardContent>
        </Card>
      </div>

      {/* Contact Footer */}
      <div className="text-center pt-8 border-t border-border/40">
        <p className="text-muted-foreground">
          Dúvidas? Fale com a gente:{" "}
          <a
            href="mailto:legal@lemon.finance"
            className="text-primary hover:underline font-medium"
          >
            legal@lemon.finance
          </a>
        </p>
      </div>
    </div>
  );
}
