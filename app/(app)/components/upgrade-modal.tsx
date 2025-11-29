"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
}

export function UpgradeModal({
  isOpen,
  onClose,
  featureName,
}: UpgradeModalProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    router.push("/team?tab=subscription");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto bg-blue-100 p-3 rounded-full mb-4">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <DialogTitle className="text-center text-xl">
            Desbloqueie {featureName}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Esta funcionalidade é exclusiva do plano PRO. Assine agora para ter
            acesso ilimitado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="flex items-center gap-3 text-sm">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>Leitura automática de recibos com IA</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>Membros ilimitados na equipe</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>Suporte prioritário</span>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            onClick={handleUpgrade}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Assinar Plano PRO
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Talvez depois
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
