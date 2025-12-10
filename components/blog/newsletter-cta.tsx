"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Sparkles } from "lucide-react";

export function NewsletterCTA() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary/5 p-8 md:p-12 border border-primary/20">
      <div className="absolute right-0 top-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto">
        <div className="rounded-full bg-primary/10 p-3 ring-1 ring-primary/20">
          <Mail className="h-6 w-6 text-primary" />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center justify-center gap-2">
            Inscreva-se na nossa Newsletter
            <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
          </h3>
          <p className="text-muted-foreground md:text-lg">
            Receba dicas práticas de finanças para casais e novidades do Lemon
            diretamente no seu e-mail. Sem spam.
          </p>
        </div>

        <form
          className="flex w-full max-w-sm flex-col gap-3 sm:flex-row"
          onSubmit={(e) => e.preventDefault()}
        >
          <Input
            type="email"
            placeholder="seu@melhoremail.com"
            className="h-11 bg-background"
            required
          />
          <Button type="submit" size="lg" className="h-11 px-8 font-semibold">
            Inscrever-se
          </Button>
        </form>

        <p className="text-xs text-muted-foreground">
          Ao se inscrever, você concorda com nossos termos e política de
          privacidade.
        </p>
      </div>
    </div>
  );
}
