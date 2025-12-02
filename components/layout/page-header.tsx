import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  /** Título principal da página */
  title: string;
  /** Subtítulo ou descrição opcional */
  subtitle?: string;
  /** Elemento de ação (geralmente um Button) */
  action?: React.ReactNode;
  /** Breadcrumb ou navegação opcional */
  breadcrumb?: React.ReactNode;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * Header padronizado de página com título, subtítulo opcional e ação
 * Uso: Topo de cada página principal do sistema
 *
 * Exemplos:
 * - Dashboard: greeting + período selecionado + seletor
 * - Expenses: título + resumo + botão "Adicionar despesa"
 */
export function PageHeader({
  title,
  subtitle,
  action,
  breadcrumb,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {breadcrumb && (
        <div className="text-sm text-muted-foreground">{breadcrumb}</div>
      )}

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-base text-muted-foreground max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}
