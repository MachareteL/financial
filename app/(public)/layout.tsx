"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { JsonLd } from "@/components/seo/json-ld";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { name: "Termos de Uso", href: "/terms" },
    { name: "Política de Privacidade", href: "/privacy" },
    { name: "Segurança", href: "/security" },
  ];

  const isBlog = pathname?.startsWith("/blog");
  const isQuiz = pathname?.startsWith("/quiz");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Lemon Financial",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BRL",
    },
  };

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/30">
      <JsonLd schema={jsonLd} />
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                Lemon
              </span>
            </Link>
            <div className="hidden sm:block h-6 w-px bg-border mx-2" />
            <span className="hidden sm:block text-sm font-medium text-muted-foreground">
              {isBlog ? "Blog" : "Centro Legal"}
            </span>
          </div>

          <Button variant="ghost" size="sm" asChild className="gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Voltar para Home
            </Link>
          </Button>
        </div>
      </header>

      <main className="relative">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] max-w-7xl pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Navigation Tabs */}
          {!isBlog && !isQuiz && (
            <div className="flex flex-wrap gap-2 mb-12 border-b border-border/50 pb-1">
              {tabs.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors relative top-px border-b-2",
                    pathname === tab.href
                      ? "border-primary text-primary bg-primary/5"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {tab.name}
                </Link>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/20 py-12 mt-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Lemon Financial. Todos os direitos
            reservados.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-2">
            Feito com segurança e transparência para você.
          </p>
        </div>
      </footer>
    </div>
  );
}
