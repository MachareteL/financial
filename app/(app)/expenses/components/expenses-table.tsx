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
import { Calendar, CreditCard, FileText, Edit, Loader2 } from "lucide-react";
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
    <Card className="border-none shadow-sm overflow-hidden bg-white ring-1 ring-slate-200">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 border-b border-slate-100">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[140px] font-semibold text-xs uppercase tracking-wider text-slate-500">
                  Data
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-slate-500">
                  Descrição
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-slate-500">
                  Categoria
                </TableHead>
                <TableHead className="text-center w-[80px] font-semibold text-xs uppercase tracking-wider text-slate-500">
                  Nota
                </TableHead>
                <TableHead className="text-right font-semibold text-xs uppercase tracking-wider text-slate-500">
                  Valor
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedExpenses.length === 0 && !hasMore ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <p className="text-lg font-medium">
                        Nenhuma despesa cadastrada!
                      </p>
                      <p className="text-sm">
                        As despesas mais recentes aparecerão aqui.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                displayedExpenses.map((expense, index) => {
                  const isLastItem = index === displayedExpenses.length - 1;
                  const { theme } = getCategoryStyle(
                    expense.category?.budgetCategoryName || null
                  );

                  return (
                    <TableRow
                      key={expense.id}
                      className="group hover:bg-slate-50/80 transition-colors border-slate-50"
                      ref={isLastItem ? lastExpenseElementRef : null}
                    >
                      <TableCell className="text-slate-500 font-medium text-xs whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="bg-slate-100 p-1.5 rounded-md text-slate-500">
                            <Calendar className="w-3 h-3" />
                          </div>
                          {new Date(
                            expense.date.replace(/-/g, "/")
                          ).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-700 text-sm group-hover:text-blue-700 transition-colors">
                            {expense.description}
                          </span>
                          {expense.isInstallment && (
                            <span className="text-[10px] text-purple-600 font-bold flex items-center gap-1 mt-0.5">
                              <CreditCard className="w-2.5 h-2.5" /> Parcela{" "}
                              {expense.installmentNumber}/
                              {expense.totalInstallments}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`font-medium border border-transparent ${theme.badge} py-1`}
                        >
                          {expense.category?.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {expense.receiptUrl ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-500 bg-blue-50/50 hover:bg-blue-100 rounded-lg mx-auto transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedReceipt(expense.receiptUrl!);
                            }}
                            title="Ver Comprovante"
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                        ) : (
                          <span className="text-slate-300 text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-bold text-slate-900 tabular-nums">
                        R${" "}
                        {expense.amount.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>
                        {can("MANAGE_EXPENSES") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-blue-600 transition-all"
                            onClick={() =>
                              router.push(`/expenses/${expense.id}/edit`)
                            }
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
              {hasMore && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    <div className="flex justify-center">
                      <Loader2 className="animate-spin text-slate-400 w-5 h-5" />
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
