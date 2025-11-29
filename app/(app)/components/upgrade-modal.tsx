import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { useTeam } from "@/app/(app)/team/team-provider";
import { subscribeTeamAction } from "@/app/(app)/team/_actions/subscription.actions";
import { notify } from "@/lib/notify-helper";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export function UpgradeModal({
  isOpen,
  onClose,
  featureName,
}: UpgradeModalProps) {
  const { currentTeam } = useTeam();
  const [isLoading, setIsLoading] = useState(false);
  const [billingInterval, setBillingInterval] = useState<"month" | "year">(
    "month"
  );

  const handleSubscribe = async () => {
    if (!currentTeam) return;
    setIsLoading(true);
    try {
      const priceId =
        billingInterval === "month"
          ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY
          : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY;

      if (!priceId) {
        throw new Error("Price ID not configured");
      }

      await subscribeTeamAction(currentTeam.team.id, priceId);
    } catch (error: any) {
      notify.error(error, "iniciar assinatura");
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="mx-auto bg-blue-100 p-3 rounded-full mb-4">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <DialogTitle className="text-center text-xl">
            {featureName
              ? `Desbloqueie ${featureName}`
              : "Faça o Upgrade para PRO"}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            {featureName
              ? "Esta funcionalidade é exclusiva do plano PRO."
              : "Tenha acesso ilimitado a todas as funcionalidades."}{" "}
            Assine agora e potencialize sua gestão.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              Benefícios PRO:
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Leitura de recibos com IA</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Membros ilimitados</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Suporte prioritário</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Insights financeiros</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 justify-center">
            <div
              className={`border rounded-xl p-4 cursor-pointer transition-all relative ${
                billingInterval === "year"
                  ? "border-blue-500 bg-blue-50/50"
                  : "hover:border-blue-300"
              }`}
              onClick={() => setBillingInterval("year")}
            >
              <div className="absolute -top-3 right-4 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                MELHOR VALOR
              </div>
              <div className="font-semibold">Anual</div>
              <div className="text-2xl font-bold">
                R$ 29,90
                <span className="text-sm font-normal text-muted-foreground">
                  /mês
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Cobrado anualmente (R$ 358,80)
              </div>
            </div>

            <div
              className={`border rounded-xl p-4 cursor-pointer transition-all ${
                billingInterval === "month"
                  ? "border-blue-500 bg-blue-50/50"
                  : "hover:border-blue-300"
              }`}
              onClick={() => setBillingInterval("month")}
            >
              <div className="font-semibold">Mensal</div>
              <div className="text-2xl font-bold">
                R$ 39,90
                <span className="text-sm font-normal text-muted-foreground">
                  /mês
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Cancele quando quiser
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processando...
              </>
            ) : (
              "Assinar Agora"
            )}
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Talvez depois
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
