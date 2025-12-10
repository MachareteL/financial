"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Loader2, FileSpreadsheet, Lock } from "lucide-react";
import { exportExpensesAction } from "../_actions/expense.actions";
import { notify } from "@/lib/notify-helper";
import { UpgradeModal } from "@/components/subscription/upgrade-modal";

interface ExportExpensesDialogProps {
  teamId: string;
  isPro: boolean;
}

export function ExportExpensesDialog({
  teamId,
  isPro,
}: ExportExpensesDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<string>(currentYear.toString());
  const [month, setMonth] = useState<string>("all");

  const handleExport = async () => {
    setIsLoading(true);
    try {
      let startDate: Date;
      let endDate: Date;

      if (month === "all") {
        startDate = new Date(parseInt(year), 0, 1);
        endDate = new Date(parseInt(year), 11, 31, 23, 59, 59);
      } else {
        startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      }

      const base64Data = await exportExpensesAction(
        teamId,
        startDate.toISOString(),
        endDate.toISOString()
      );

      // Trigger Download
      const link = document.createElement("a");
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64Data}`;
      const fileName = `despesas_${year}${
        month !== "all" ? `_${month.padStart(2, "0")}` : ""
      }.xlsx`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      notify.success("Exportação concluída com sucesso!");
      setOpen(false);
    } catch (error) {
      if (error instanceof Error && error.message.includes("PRO")) {
        notify.error("Funcionalidade exclusiva para PRO.", "Exportar");
      } else {
        notify.error(error, "exportar despesas");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isPro) {
    return (
      <>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setShowUpgradeModal(true)}
        >
          <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
          <span className="hidden sm:inline text-muted-foreground/80">
            Exportar
          </span>
          <Lock className="w-3 h-3 text-muted-foreground/50 ml-1" />
        </Button>
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          featureName="Exportação para Excel"
          description="Exporte suas despesas para Excel e tenha controle total dos seus dados com o plano PRO."
        />
      </>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">Exportar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Exportar Despesas</DialogTitle>
          <DialogDescription>
            Selecione o período que deseja exportar para Excel. Esta
            funcionalidade é exclusiva do plano PRO.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ano</label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mês</label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo o ano</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {new Date(0, i).toLocaleString("pt-BR", {
                        month: "long",
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleExport}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Baixar Planilha
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
