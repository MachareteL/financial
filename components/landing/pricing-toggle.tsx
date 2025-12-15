"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function PricingToggle() {
  const [isAnnual, setIsAnnual] = useState(true);
  const router = useRouter();

  return (
    <>
      <div className="mt-8 flex items-center justify-center gap-4">
        <span
          className={`text-sm font-medium transition-colors ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}
        >
          Mensal
        </span>
        <button
          onClick={() => setIsAnnual(!isAnnual)}
          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isAnnual ? "bg-primary" : "bg-muted"}`}
          role="switch"
          aria-checked={isAnnual}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${isAnnual ? "translate-x-8" : "translate-x-1"}`}
          />
        </button>
        <span
          className={`text-sm font-medium transition-colors ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}
        >
          Anual
        </span>
        {isAnnual && (
          <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
            51% OFF
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
        {/* Plano Free */}
        <Card className="border-border shadow-sm hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="text-2xl">Starter</CardTitle>
            <CardDescription>
              Para dar os primeiros passos na organização.
            </CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">Grátis</span>
              <span className="text-muted-foreground"> para sempre</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                <span>1 equipe</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Lançamentos manuais ilimitados</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Dashboards e visão macro das finanças</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Categorias e orçamentos</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground/50">
                <X className="w-4 h-4 flex-shrink-0" />
                <span>Leitura de recibos com IA</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground/50">
                <X className="w-4 h-4 flex-shrink-0" />
                <span>Equipes adicionais</span>
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
            MAIS POPULAR
          </div>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              Pro
              <Sparkles className="w-5 h-5 text-primary fill-current" />
            </CardTitle>
            <CardDescription>
              Para casais que querem automatizar tudo.
            </CardDescription>
            <div className="mt-4">
              {isAnnual ? (
                <>
                  <span className="text-4xl font-bold">R$ 19</span>
                  <span className="text-muted-foreground">/mês</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cobrado <span className="font-semibold">R$ 228/ano</span>
                  </p>
                  <p className="text-xs text-primary font-medium mt-1">
                    Economia de R$ 251,80/ano
                  </p>
                </>
              ) : (
                <>
                  <span className="text-4xl font-bold">R$ 39,90</span>
                  <span className="text-muted-foreground">/mês</span>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Tudo do Starter, mais:</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                <span>
                  <strong>Leitura de recibos com IA</strong> ilimitada
                </span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Insights e analytics avançados</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Metas compartilhadas</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Suporte prioritário</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button
              size="lg"
              className="w-full shadow-lg shadow-primary/20"
              onClick={() => router.push("/auth")}
            >
              Experimente 14 dias grátis
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Sem compromisso. Cancele quando quiser.
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
