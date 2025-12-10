import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { DashboardDataDTO } from "@/domain/dto/dashboard.types.d.ts";

interface RecentTransactionsProps {
  transactions: DashboardDataDTO["recentTransactions"];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const router = useRouter();

  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-6 h-full">
      <Card className="h-full flex flex-col border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="pb-3 border-b border-slate-50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-bold text-slate-800">
              Últimas Despesas
            </CardTitle>
            <Button
              size="icon"
              className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20"
              onClick={() => router.push("/expenses/new")}
              title="Nova Despesa"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1">
          {transactions && transactions.length > 0 ? (
            <div className="divide-y divide-border">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group cursor-pointer"
                  onClick={() => router.push(`/expenses/${tx.id}/edit`)}
                >
                  <div className="flex flex-col gap-1 max-w-[60%]">
                    <span
                      className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors"
                      title={tx.description || ""}
                    >
                      {tx.description || "Sem descrição"}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 truncate max-w-[100px] font-medium">
                        {tx.categoryName}
                      </span>
                      <span>
                        •{" "}
                        {new Date(tx.date + "T12:00:00").toLocaleDateString(
                          "pt-BR",
                          { day: "2-digit", month: "2-digit" }
                        )}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-slate-900 whitespace-nowrap tabular-nums">
                    - {formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center ring-1 ring-slate-100">
                <ShoppingBag className="w-8 h-8 text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Nenhuma despesa recente
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Comece a registrar suas despesas para ver o histórico.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/expenses/new")}
                className="border-slate-200"
              >
                Registrar Agora
              </Button>
            </div>
          )}
        </CardContent>
        {transactions && transactions.length > 0 && (
          <div className="p-3 border-t border-slate-100 bg-slate-50/30">
            <Button
              variant="ghost"
              className="w-full text-xs text-slate-500 hover:text-blue-600 hover:bg-blue-50 h-9 font-medium"
              onClick={() => router.push("/expenses")}
            >
              Ver extrato completo <ArrowRight className="ml-1 w-3 h-3" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
