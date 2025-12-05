"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail } from "lucide-react";

export function NewsletterCTA() {
  return (
    <Card className="my-8 bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Assine a Newsletter do Lemon
        </CardTitle>
        <CardDescription>
          Receba dicas exclusivas de finanças e novidades do app diretamente no
          seu e-mail.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col sm:flex-row gap-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <Input
            type="email"
            placeholder="seu@email.com"
            className="flex-1 bg-background"
          />
          <Button type="submit">Inscrever-se</Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2">
          Não enviamos spam. Cancele a qualquer momento.
        </p>
      </CardContent>
    </Card>
  );
}
