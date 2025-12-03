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
  const [loadingInterval, setLoadingInterval] = useState<
    "month" | "year" | null
  >(null);

  const handleSubscribe = async (interval: "month" | "year") => {
    if (!currentTeam) return;
    setLoadingInterval(interval);
    try {
      const priceId =
        interval === "month"
          ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY
          : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY;

      if (!priceId) {
        throw new Error("Price ID not configured");
      }

      await subscribeTeamAction(currentTeam.team.id, priceId);
    } catch (error: unknown) {
      notify.error(error, "iniciar assinatura");
      setLoadingInterval(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
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
            Escolha o plano ideal para sua equipe.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-4">
          {/* Plano Anual */}
          <div className="border border-primary bg-primary/5 rounded-xl p-6 flex flex-col relative">
            <div className="absolute -top-3 right-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
              MELHOR VALOR
            </div>
            <div className="mb-4">
              <h3 className="font-semibold text-lg">Anual</h3>
              <div className="text-3xl font-bold mt-2">
                R$ 19,90
                <span className="text-sm font-normal text-muted-foreground">
                  /mês
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Cobrado anualmente (R$ 238,80)
              </p>
            </div>

            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Economize 50%</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Todos os recursos PRO</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Suporte prioritário</span>
              </li>
            </ul>

            <Button
              onClick={() => handleSubscribe("year")}
              disabled={!!loadingInterval}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {loadingInterval === "year" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                "Assinar Anual"
              )}
            </Button>
          </div>

          {/* Plano Mensal */}
          <div className="border rounded-xl p-6 flex flex-col">
            <div className="mb-4">
              <h3 className="font-semibold text-lg">Mensal</h3>
              <div className="text-3xl font-bold mt-2">
                R$ 39,90
                <span className="text-sm font-normal text-muted-foreground">
                  /mês
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Cancele quando quiser
              </p>
            </div>

            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                <span>Flexibilidade total</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Todos os recursos PRO</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Acesso imediato</span>
              </li>
            </ul>

            <Button
              variant="outline"
              onClick={() => handleSubscribe("month")}
              disabled={!!loadingInterval}
              className="w-full"
            >
              {loadingInterval === "month" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                "Assinar Mensal"
              )}
            </Button>
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground"
          >
            Talvez depois
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
