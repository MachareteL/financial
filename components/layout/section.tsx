import React from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  /** Título da seção (opcional) */
  title?: string;
  /** Descrição da seção (opcional) */
  description?: string;
  /** Ação/botão no header da seção (opcional) */
  action?: React.ReactNode;
  /** Classes CSS adicionais */
  className?: string;
  /** Espaçamento interno customizado */
  spacing?: "compact" | "normal" | "spacious";
}

/**
 * Seção de conteúdo com espaçamento consistente
 * Uso: Organizar blocos de conteúdo dentro de uma página
 */
export function Section({
  children,
  title,
  description,
  action,
  className,
  spacing = "normal",
}: SectionProps) {
  const spacingClasses = {
    compact: "space-y-3",
    normal: "space-y-4",
    spacious: "space-y-6",
  };

  return (
    <section className={cn(spacingClasses[spacing], className)}>
      {(title || description || action) && (
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            {title && (
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}

      <div>{children}</div>
    </section>
  );
}
