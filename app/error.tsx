"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an analytics service
    console.error(error);
  }, [error]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Algo não saiu como esperado
          </h2>
          <p className="text-muted-foreground">
            Tivemos um problema para carregar esta página. Tente novamente.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={() => reset()} variant="default" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Tentar novamente
          </Button>
        </div>
      </div>
    </div>
  );
}
