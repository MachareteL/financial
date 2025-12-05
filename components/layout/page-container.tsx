import React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Tamanho máximo do container */
  maxWidth?: "6xl" | "7xl" | "full";
}

/**
 * Container principal de página com padding consistente e max-width responsivo
 * Uso: Envolve todo o conteúdo de uma página para garantir espaçamento padronizado
 */
export function PageContainer({
  children,
  className,
  maxWidth = "7xl",
}: PageContainerProps) {
  const maxWidthClasses = {
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <div
      className={cn(
        "mx-auto p-4 md:p-8 pb-20 space-y-8",
        "animate-in fade-in duration-500",
        maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
}
