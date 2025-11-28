import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface EmptyStateProps {
  onClearFilters?: () => void;
}

export function EmptyState({ onClearFilters }: EmptyStateProps) {
  return (
    <div className="text-center py-24 bg-white/50 rounded-3xl border border-dashed border-slate-200 animate-in fade-in zoom-in-95">
      <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ring-1 ring-slate-100">
        <Sparkles className="w-10 h-10 text-blue-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">
        Tudo limpo por aqui!
      </h3>
      <p className="text-slate-500 max-w-xs mx-auto mb-8 leading-relaxed">
        Nenhum gasto encontrado com os filtros atuais. Que tal aproveitar para
        economizar?
      </p>
      {onClearFilters && (
        <Button
          variant="outline"
          className="rounded-full border-slate-200"
          onClick={onClearFilters}
        >
          Limpar Filtros
        </Button>
      )}
    </div>
  );
}
