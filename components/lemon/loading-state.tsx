import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  /** Mensagem de loading opcional */
  message?: string;
  /** Skeleton personalizado (opcional) */
  skeleton?: React.ReactNode;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * Estado de carregamento elegante com spinner e mensagem cordial
 * Uso: Substituir spinners genéricos por estados de loading humanizados
 */
export function LoadingState({
  message = "Carregando...",
  skeleton,
  className,
}: LoadingStateProps) {
  if (skeleton) {
    return <div className={className}>{skeleton}</div>;
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 gap-4",
        className
      )}
    >
      <Loader2 className="animate-spin text-primary w-10 h-10" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
