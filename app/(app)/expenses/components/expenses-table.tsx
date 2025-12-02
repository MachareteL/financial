import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CreditCard,
  FileText,
  Edit,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { usePermission } from "@/hooks/use-permission";
import { getCategoryStyle } from "../utils";
import type { ExpenseDetailsDTO } from "@/domain/dto/expense.types.d.ts";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface ExpensesTableProps {
  displayedExpenses: ExpenseDetailsDTO[];
  lastExpenseElementRef: (node: HTMLElement | null) => void;
  setSelectedReceipt: (url: string) => void;
  router: AppRouterInstance;
  hasMore: boolean;
}

export function ExpensesTable({
  displayedExpenses,
  lastExpenseElementRef,
  setSelectedReceipt,
  router,
  hasMore,
}: ExpensesTableProps) {
  const { can } = usePermission();
  return (
    <Card className="border border-border/50 shadow-sm overflow-hidden bg-card/50">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30 border-b border-border/50">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="w-[140px] font-semibold text-[11px] uppercase tracking-wider text-muted-foreground pl-6 h-10">
                  Data
                </TableHead>
                <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground h-10">
                  Descrição
                </TableHead>
                <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground h-10">
                  Categoria
                </TableHead>
                <TableHead className="text-center w-[80px] font-semibold text-[11px] uppercase tracking-wider text-muted-foreground h-10">
                  Recibo
                </TableHead>
                <TableHead className="text-right font-semibold text-[11px] uppercase tracking-wider text-muted-foreground pr-6 h-10">
                  Valor
                </TableHead>
                <TableHead className="w-[50px] h-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedExpenses.length === 0 && !hasMore ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3">
                      <div className="bg-muted/50 rounded-full p-4">
                        <FileText className="w-8 h-8 text-muted-foreground/40" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          Nenhuma despesa encontrada
                        </p>
                        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                          Ajuste os filtros ou adicione uma nova despesa.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                displayedExpenses.map((expense, index) => {
                  const isLastItem = index === displayedExpenses.length - 1;
                  const { icon: Icon, theme } = getCategoryStyle(
                    expense.category?.budgetCategoryName || null
                  );

                  return (
                    <TableRow
                      key={expense.id}
                      className="group hover:bg-muted/30 transition-colors border-border/40 cursor-default"
                      ref={isLastItem ? lastExpenseElementRef : null}
                    >
                      <TableCell className="text-muted-foreground font-medium text-xs whitespace-nowrap pl-6 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground">
                            <span className="text-xs font-bold">
                              {new Date(
                                expense.date.replace(/-/g, "/")
                              ).getDate()}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-foreground">
                              {new Date(expense.date.replace(/-/g, "/"))
                                .toLocaleString("pt-BR", { month: "short" })
                                .toUpperCase()}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(
                                expense.date.replace(/-/g, "/")
                              ).getFullYear()}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-foreground text-sm group-hover:text-primary transition-colors line-clamp-1">
                            {expense.description}
                          </span>
                          {expense.isInstallment && (
                            <span className="text-[10px] text-purple-500 font-medium flex items-center gap-1 bg-purple-500/10 w-fit px-1.5 py-0.5 rounded-md">
                              <CreditCard className="w-3 h-3" />
                              Parcela {expense.installmentNumber}/
                              {expense.totalInstallments}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-md flex items-center justify-center ${theme.bg} ${theme.text}`}
                          >
                            <Icon className="w-3 h-3" />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">
                            {expense.category?.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-3">
                        {expense.receiptUrl ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary bg-primary/10 hover:bg-primary/20 rounded-lg mx-auto transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedReceipt(expense.receiptUrl!);
                            }}
                            title="Ver Comprovante"
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                        ) : (
                          <span className="text-muted-foreground/20 text-xs">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-bold text-foreground tabular-nums pr-6 py-3">
                        <span className="text-xs text-muted-foreground font-normal mr-1">
                          R$
                        </span>
                        {expense.amount.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="py-3">
                        {can("MANAGE_EXPENSES") && (
                          <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
                              onClick={() =>
                                router.push(`/expenses/${expense.id}/edit`)
                              }
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
              {hasMore && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    <div className="flex justify-center">
                      <Loader2 className="animate-spin text-muted-foreground w-5 h-5" />
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
