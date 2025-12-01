import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Home,
  ShoppingBag,
  PiggyBank,
  Wallet,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { DashboardDataDTO } from "@/domain/dto/dashboard.types.d.ts";

interface BudgetHealthProps {
  folders: DashboardDataDTO["folders"];
}

const getFolderConfig = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("necessidades") || n.includes("fixo")) {
    return {
      icon: Home,
      color: "text-folder-necessities",
      bg: "bg-folder-necessities/10",
      bar: "bg-folder-necessities",
    };
  }
  if (n.includes("desejos") || n.includes("lazer") || n.includes("variável")) {
    return {
      icon: ShoppingBag,
      color: "text-folder-desires",
      bg: "bg-folder-desires/10",
      bar: "bg-folder-desires",
    };
  }
  if (
    n.includes("poupança") ||
    n.includes("investimentos") ||
    n.includes("futuro")
  ) {
    return {
      icon: PiggyBank,
      color: "text-folder-savings",
      bg: "bg-folder-savings/10",
      bar: "bg-folder-savings",
    };
  }
  return {
    icon: Wallet,
    color: "text-muted-foreground",
    bg: "bg-muted/10",
    bar: "bg-muted",
  };
};

const getStatusConfig = (status: "good" | "warning" | "danger") => {
  switch (status) {
    case "good":
      return {
        label: "No Caminho",
        color: "text-success bg-success/10 border-success/20",
        icon: CheckCircle2,
      };
    case "warning":
      return {
        label: "Atenção",
        color: "text-warning bg-warning/10 border-warning/20",
        icon: AlertTriangle,
      };
    case "danger":
      return {
        label: "Excedido",
        color: "text-destructive bg-destructive/10 border-destructive/20",
        icon: AlertTriangle,
      };
  }
};

export function BudgetHealth({ folders }: BudgetHealthProps) {
  const router = useRouter();

  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const getPercentage = (spent: number, total: number) => {
    if (total === 0) return spent > 0 ? 100 : 0;
    return Math.min((spent / total) * 100, 100);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <div className="w-1 h-5 bg-blue-600 rounded-full" />
          Saúde do Orçamento
        </h2>
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-8"
          onClick={() => router.push("/budget")}
        >
          Ajustar Metas
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {folders.map((folder) => {
          const { icon: Icon, color, bg, bar } = getFolderConfig(folder.name);
          const {
            label,
            color: statusColor,
            icon: StatusIcon,
          } = getStatusConfig(folder.status);
          const percentageUsed = getPercentage(folder.spent, folder.budgeted);
          const remaining = folder.budgeted - folder.spent;

          return (
            <Card
              key={folder.id}
              className="border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <CardHeader className="pb-3 pt-5 px-5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl ${bg} group-hover:scale-105 transition-transform`}
                    >
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-800">
                        {folder.name}
                      </CardTitle>
                      <CardDescription className="text-xs font-medium mt-0.5 text-slate-500">
                        Meta: {formatCurrency(folder.budgeted)}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${statusColor} text-[10px] py-0.5 px-2 h-6 gap-1 font-semibold`}
                  >
                    <StatusIcon className="w-3 h-3" /> {label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm items-end">
                    <span className="text-slate-500 font-medium text-xs">
                      Gasto
                    </span>
                    <span className="font-bold text-slate-900 text-base">
                      {formatCurrency(folder.spent)}
                    </span>
                  </div>
                  <Progress
                    value={percentageUsed}
                    className="h-2 bg-slate-100"
                    indicatorClassName={bar}
                  />
                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-slate-400 font-medium">
                      {percentageUsed.toFixed(0)}% usado
                    </span>
                    <span
                      className={`font-bold ${
                        remaining < 0 ? "text-rose-600" : "text-emerald-600"
                      }`}
                    >
                      {remaining < 0 ? "Excedido: " : "Disponível: "}
                      {formatCurrency(Math.abs(remaining))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
