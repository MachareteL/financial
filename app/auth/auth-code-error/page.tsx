"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function AuthCodeErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  return (
    <Card className="w-full max-w-md border-red-200 shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-6 h-6" />
          <CardTitle className="text-2xl font-bold">Erro de Autenticação</CardTitle>
        </div>
        <CardDescription>
          Ocorreu um problema ao verificar suas credenciais.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-red-50 p-4 rounded-md border border-red-100 text-sm text-red-800">
          <p className="font-semibold">{error || "Erro desconhecido"}</p>
          <p>{errorDescription || "Não foi possível validar o link de acesso. Ele pode ter expirado ou já ter sido utilizado."}</p>
        </div>

        <div className="pt-2">
          <Button asChild className="w-full bg-slate-900 hover:bg-slate-800">
            <Link href="/auth">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Login
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Suspense fallback={<div>Carregando...</div>}>
        <AuthCodeErrorContent />
      </Suspense>
    </div>
  );
}
