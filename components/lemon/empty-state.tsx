import React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  /** Ilustração ou ícone (opcional) */
  illustration?: React.ReactNode;
  /** Título do empty state */
  title: string;
  /** Mensagem explicativa cordial */
  message: string;
  /** Ação principal (opcional) */
  action?: React.ReactNode;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * Estado vazio elegante com ilustração, mensagem cordial e ação
 * Uso: Substituir listas vazias genéricas por mensagens humanizadas
 *
 * Exemplo:
 * <EmptyState
 *   title="Nenhuma despesa ainda"
 *   message="Quando você registrar uma despesa, ela aparecerá aqui."
 *   action={<Button>Registrar primeira despesa</Button>}
 * />
 */
export function EmptyState({
  illustration,
  title,
  message,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-4",
        "space-y-4",
        className
      )}
    >
      {illustration && <div className="mb-2 opacity-60">{illustration}</div>}

      <div className="space-y-2 max-w-md">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {message}
        </p>
      </div>

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
