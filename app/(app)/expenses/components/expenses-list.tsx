import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  CreditCard,
  Edit,
  Trash2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { usePermission } from "@/hooks/use-permission";
import { getCategoryStyle } from "../utils";
import { EmptyState } from "@/components/lemon/empty-state";
import { notify } from "@/lib/notify-helper";
import type { ExpenseDetailsDTO } from "@/domain/dto/expense.types.d.ts";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface ExpensesListProps {
  groupedExpenses: Record<string, ExpenseDetailsDTO[]>;
  lastExpenseElementRef: (node: HTMLElement | null) => void;
  setSelectedReceipt: (url: string) => void;
  handleDelete: (id: string) => void;
  router: AppRouterInstance;
  hasMore: boolean;
  onClearFilters: () => void;
}

export function ExpensesList({
  groupedExpenses,
  lastExpenseElementRef,
  setSelectedReceipt,
  handleDelete,
  router,
  hasMore,
  onClearFilters,
}: ExpensesListProps) {
  const { can } = usePermission();

  if (Object.entries(groupedExpenses).length === 0) {
    return (
      <EmptyState
        title="Tudo limpo por aqui!"
        message="Nenhuma despesa encontrada com os filtros atuais."
        illustration={
          <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ring-1 ring-slate-100">
            <Sparkles className="w-10 h-10 text-blue-400" />
          </div>
        }
        action={
          onClearFilters && (
            <Button
              variant="outline"
              className="rounded-full border-slate-200"
              onClick={onClearFilters}
            >
              Limpar Filtros
            </Button>
          )
        }
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {Object.entries(groupedExpenses).map(([dateLabel, items], groupIndex) => (
        <div key={dateLabel} className="space-y-4">
          <div className="flex items-center gap-4 pl-1">
            <div className="h-px flex-1 bg-border/40" />
            <div className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 bg-background px-2">
              <CalendarDays className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-70" />
              {dateLabel}
            </div>
            <div className="h-px flex-1 bg-border/40" />
          </div>

          <div className="grid gap-3">
            {items.map((expense, index) => {
              const { icon: Icon, theme } = getCategoryStyle(
                expense.category?.budgetCategoryName || null
              );
              const isLastItem =
                groupIndex === Object.entries(groupedExpenses).length - 1 &&
                index === items.length - 1;

              return (
                <div
                  key={expense.id}
                  ref={isLastItem ? lastExpenseElementRef : null}
                  onClick={() => {
                    if (expense.receiptUrl) {
                      setSelectedReceipt(expense.receiptUrl);
                    } else {
                      notify.info("Nenhum comprovante anexado.");
                    }
                  }}
                  className="group relative bg-card px-4 sm:px-5 py-3 sm:py-4 rounded-2xl border border-border/40 shadow-sm hover:shadow-card-hover hover:border-primary/20 transition-all duration-300 cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 mt-0.5 sm:mt-0 ${theme.bg} ${theme.text}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3">
                        <h3 className="font-semibold text-foreground text-sm line-clamp-2 sm:truncate group-hover:text-primary transition-colors leading-tight flex-1 min-w-0">
                          {expense.description}
                        </h3>
                        <span className="font-bold text-foreground text-sm whitespace-nowrap tabular-nums flex-shrink-0">
                          - R${" "}
                          {expense.amount.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-1 sm:mt-0">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                          <span className="bg-muted/50 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide">
                            {expense.category?.name}
                          </span>
                          {expense.isInstallment && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-border" />
                              <span className="text-purple-500 font-medium flex items-center gap-1">
                                <CreditCard className="w-3 h-3" />
                                {expense.installmentNumber}/
                                {expense.totalInstallments}
                              </span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 -mr-2">
                          {can("MANAGE_EXPENSES") && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/expenses/${expense.id}/edit`);
                                }}
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(expense.id);
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {hasMore && (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin w-6 h-6 text-muted-foreground/50" />
        </div>
      )}
    </div>
  );
}
