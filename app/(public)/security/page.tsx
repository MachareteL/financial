import type { Metadata } from "next";
import {
  ShieldCheck,
  Lock,
  Server,
  RefreshCw,
  FileKey,
  Fingerprint,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Segurança e Compliance | Lemon",
  description:
    "Detalhes sobre a infraestrutura de segurança, criptografia e proteção de dados do Lemon.",
};

export default function SecurityPage() {
  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <Badge
          variant="outline"
          className="px-4 py-1 border-primary/20 bg-primary/5 text-primary"
        >
          Infraestrutura de Classe Mundial
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          Segurança e Compliance
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A proteção dos seus ativos digitais é o pilar central da nossa
          arquitetura. Conheça os protocolos que garantem a integridade e
          disponibilidade dos seus dados.
        </p>
      </div>

      {/* Main Security Statement */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary mb-2">
            <ShieldCheck className="h-5 w-5" />
            <span className="font-bold uppercase tracking-wider text-xs">
              Padrão Bancário
            </span>
          </div>
          <CardTitle className="text-xl">
            Criptografia de Ponta a Ponta
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground leading-relaxed">
          <p>
            Utilizamos os mesmos protocolos de segurança adotados pelas maiores
            instituições financeiras do mundo. Seus dados são criptografados
            tanto em repouso (AES-256) quanto em trânsito (TLS 1.3), garantindo
            que apenas você tenha acesso às suas informações sensíveis.
          </p>
        </CardContent>
      </Card>

      {/* Security Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Infrastructure */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-colors">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 text-blue-500">
              <Server className="h-5 w-5" />
            </div>
            <CardTitle>Infraestrutura Segura</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            Nossos servidores são hospedados em data centers com certificação
            SOC 2 Type II e ISO 27001. A arquitetura é distribuída globalmente
            (Edge Computing) para garantir baixa latência e alta resiliência
            contra ataques DDoS.
          </CardContent>
        </Card>

        {/* 2. Data Availability */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-colors">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-4 text-green-500">
              <RefreshCw className="h-5 w-5" />
            </div>
            <CardTitle>Disponibilidade e Backups</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            Realizamos backups automáticos e contínuos (Point-in-Time Recovery)
            de todos os bancos de dados. Nossa infraestrutura possui redundância
            geográfica para assegurar a continuidade do serviço mesmo em
            cenários de falha crítica.
          </CardContent>
        </Card>

        {/* 3. Access Control */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-colors">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 text-purple-500">
              <Fingerprint className="h-5 w-5" />
            </div>
            <CardTitle>Controle de Acesso Rigoroso</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            O acesso aos dados de produção é estritamente limitado a engenheiros
            autorizados, mediante autenticação multifator (MFA) e VPN
            corporativa. Todos os acessos são logados e auditados para garantir
            conformidade.
          </CardContent>
        </Card>

        {/* 4. Data Privacy */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-colors">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4 text-orange-500">
              <FileKey className="h-5 w-5" />
            </div>
            <CardTitle>Privacidade por Design</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            Adotamos o princípio de <i>Privacy by Design</i>. Dados sensíveis,
            como senhas e chaves de API, nunca são armazenados em texto simples.
            Utilizamos algoritmos de hash robustos (Argon2/Bcrypt) para proteção
            de credenciais.
          </CardContent>
        </Card>
      </div>

      {/* Compliance Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-primary" />
          Conformidade Regulatória
        </h2>
        <Card className="bg-muted/30 border-none">
          <CardContent className="pt-6 text-sm text-muted-foreground leading-relaxed space-y-4">
            <p>
              O Lemon opera em total conformidade com a{" "}
              <strong>Lei Geral de Proteção de Dados (LGPD)</strong> do Brasil e
              segue as diretrizes da <strong>GDPR</strong> europeia.
            </p>
            <p>
              Mantemos políticas claras de retenção de dados e oferecemos
              ferramentas para que você exerça seus direitos de titularidade
              (acesso, retificação e exclusão) de forma autônoma e imediata.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center pt-8 border-t border-border/40">
        <p className="text-muted-foreground">
          Para reportar vulnerabilidades ou dúvidas de segurança:{" "}
          <a
            href="mailto:security@lemon.finance"
            className="text-primary hover:underline font-medium"
          >
            security@lemon.finance
          </a>
        </p>
      </div>
    </div>
  );
}
