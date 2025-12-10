"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  CreditCard,
  Loader2,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import type { Subscription } from "@/domain/entities/subscription";
import { manageSubscriptionAction } from "../../_actions/subscription.actions";
import { notify } from "@/lib/notify-helper";

interface ActivePlanCardProps {
  subscription: Subscription;
  teamId: string;
}

export function ActivePlanCard({ subscription, teamId }: ActivePlanCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleManage = async () => {
    setIsLoading(true);
    try {
      const url = await manageSubscriptionAction(teamId);
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("Falha ao gerar URL de gerenciamento.");
      }
    } catch (error: unknown) {
      notify.error(error, "gerenciar assinatura");
      setIsLoading(false);
    }
  };

  const nextBillingDate = subscription.currentPeriodEnd
    ? subscription.currentPeriodEnd.toLocaleDateString()
    : "N/A";

  return (
    <Card className="border-success/20 bg-gradient-to-br from-success/5 to-background shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-success text-success-foreground hover:bg-success/90 border-0 px-3 py-1">
                PRO ATIVO
              </Badge>
              {subscription.status === "trialing" && (
                <Badge variant="outline" className="text-info border-info/50">
                  Em Testes
                </Badge>
              )}
            </div>
            <CardTitle className="text-2xl">Plano Profissional</CardTitle>
            <CardDescription className="mt-1">
              Sua equipe tem acesso a todos os recursos premium.
            </CardDescription>
          </div>
          <div className="bg-success/10 p-3 rounded-full hidden sm:block">
            <ShieldCheck className="w-8 h-8 text-success" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Details Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="bg-background p-2 rounded-md border shadow-sm">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Próxima renovação</p>
                <p>{nextBillingDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="bg-background p-2 rounded-md border shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="font-medium text-foreground">Status</p>
                <p className="capitalize">
                  {subscription.status === "active"
                    ? "Ativo"
                    : subscription.status}
                </p>
              </div>
            </div>
          </div>

          {/* Action Column */}
          <div className="flex flex-col justify-end">
            <Button
              onClick={handleManage}
              disabled={isLoading}
              variant="outline"
              className="w-full sm:w-auto ml-auto"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CreditCard className="w-4 h-4 mr-2" />
              )}
              Gerenciar Cobrança e Cartões
            </Button>
            <p className="text-xs text-muted-foreground text-right mt-2">
              Gerenciado via Portal do Cliente Stripe
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
