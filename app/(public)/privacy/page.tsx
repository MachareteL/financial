import type { Metadata } from "next";
import { Lock, Server, ShieldCheck, UserCheck, FileJson } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Política de Privacidade | Lemon",
  description: "Política de privacidade, proteção de dados e cookies do Lemon.",
};

export default function PrivacyPage() {
  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <Badge
          variant="outline"
          className="px-4 py-1 border-primary/20 bg-primary/5 text-primary"
        >
          Em conformidade com a LGPD
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          Política de Privacidade
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Transparência total sobre como cuidamos dos seus dados.
        </p>
      </div>

      {/* Intro Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary mb-2">
            <Lock className="h-5 w-5" />
            <span className="font-bold uppercase tracking-wider text-xs">
              Nosso Compromisso
            </span>
          </div>
          <CardTitle className="text-xl">Seus dados são seus</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground leading-relaxed">
          <p>
            O Lemon trata seus dados com seriedade.{" "}
            <strong>Não vendemos suas informações.</strong>
            Coletamos apenas o necessário para o serviço funcionar e para
            cumprir a lei. Tudo é feito com transparência e segurança.
          </p>
        </CardContent>
      </Card>

      {/* Data Collection Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FileJson className="h-6 w-6 text-primary" />O que coletamos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="list-disc list-inside space-y-1">
                <li>Nome e Email</li>
                <li>Senha (Criptografada)</li>
                <li>Foto de Perfil</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Dados Financeiros</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="list-disc list-inside space-y-1">
                <li>Suas transações</li>
                <li>Fotos de Recibos</li>
                <li>Orçamentos definidos</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Dados Técnicos</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="list-disc list-inside space-y-1">
                <li>Endereço IP</li>
                <li>Tipo de dispositivo</li>
                <li>Registros de acesso</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Processors Table */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Server className="h-6 w-6 text-primary" />
          Parceiros e Processamento
        </h2>
        <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-border/50">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[200px]">Parceiro</TableHead>
                <TableHead>Para que serve</TableHead>
                <TableHead>O que compartilha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  Infraestrutura em Nuvem
                </TableCell>
                <TableCell>Banco de Dados & Login</TableCell>
                <TableCell className="text-muted-foreground">
                  Tudo (Criptografado)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Provedores de IA</TableCell>
                <TableCell>Ler seus recibos</TableCell>
                <TableCell className="text-muted-foreground">
                  Texto dos recibos (Anônimo)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  Gateway de Pagamento
                </TableCell>
                <TableCell>Cobrar assinatura</TableCell>
                <TableCell className="text-muted-foreground">
                  Dados do Cartão (Seguro)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  Plataforma de Edge
                </TableCell>
                <TableCell>Hospedagem do Site</TableCell>
                <TableCell className="text-muted-foreground">
                  Dados de conexão
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Rights & Security Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-primary" />
            Direitos do Titular
          </h2>
          <Card className="bg-muted/30 border-none">
            <CardContent className="pt-6 space-y-4">
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-none">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-foreground">
                    Acesso e Portabilidade
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Solicite cópia integral dos seus dados para transferência.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-none">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-foreground">
                    Retificação e Eliminação
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Corrija inexatidões ou solicite a exclusão definitiva.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-none">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-foreground">
                    Gestão de Consentimento
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Revogue autorizações de tratamento a qualquer momento.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Segurança da Informação
          </h2>
          <Card className="bg-muted/30 border-none h-full">
            <CardContent className="pt-6 text-sm text-muted-foreground leading-relaxed space-y-4">
              <p>
                A segurança é pilar fundamental do Lemon. Utilizamos
                criptografia avançada e monitoramento contínuo para proteger
                seus ativos digitais.
              </p>
              <p>
                Para detalhes técnicos sobre nossa infraestrutura, criptografia
                e conformidade, visite nossa página dedicada.
              </p>
              <div className="pt-2">
                <a
                  href="/security"
                  className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                >
                  Ver Detalhes de Segurança &rarr;
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Footer */}
      <div className="text-center pt-8 border-t border-border/40">
        <p className="text-muted-foreground">
          Fale com nosso encarregado de dados:{" "}
          <a
            href="mailto:privacy@lemon.finance"
            className="text-primary hover:underline font-medium"
          >
            privacy@lemon.finance
          </a>
        </p>
      </div>
    </div>
  );
}
