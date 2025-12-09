import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <FileQuestion className="w-6 h-6 text-primary" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Página não encontrada
          </h2>
          <p className="text-muted-foreground">
            Parece que essa página não existe ou foi movida.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button asChild variant="default">
            <Link href="/dashboard">Voltar para o início</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/feedback">Reportar um problema</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
