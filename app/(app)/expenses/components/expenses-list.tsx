import { Button } from "@/components/ui/button";
import { CalendarDays, CreditCard, Edit, Trash2, Loader2 } from "lucide-react";
import { usePermission } from "@/hooks/use-permission";
import { getCategoryStyle } from "../utils";
import { EmptyState } from "./empty-state";
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
    return <EmptyState onClearFilters={onClearFilters} />;
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedExpenses).map(([dateLabel, items], groupIndex) => (
        <div key={dateLabel} className="space-y-3">
          <div className="flex items-center gap-3 pl-2">
            <div className="h-px flex-1 bg-slate-200/60" />
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <CalendarDays className="w-3 h-3" />
              {dateLabel}
            </div>
            <div className="h-px flex-1 bg-slate-200/60" />
          </div>

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
                    notify.info("Sem anexo disponível");
                  }
                }}
                className="group relative bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200 cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${theme.bg} ${theme.text}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-slate-800 text-sm truncate">
                        {expense.description}
                      </h3>
                      <span className="font-bold text-slate-900 text-sm whitespace-nowrap">
                        - R${" "}
                        {expense.amount.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-0.5">
                      <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
                        <span>{expense.category?.name}</span>
                        {expense.isInstallment && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="text-purple-600 font-medium flex items-center gap-0.5">
                              <CreditCard className="w-2.5 h-2.5" />
                              {expense.installmentNumber}/
                              {expense.totalInstallments}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-1 -mr-1">
                        {can("MANAGE_EXPENSES") && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
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
                              className="h-6 w-6 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
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
      ))}

      {hasMore && (
        <div className="flex justify-center py-6 opacity-50">
          <Loader2 className="animate-spin w-6 h-6 text-slate-400" />
        </div>
      )}
    </div>
  );
}
