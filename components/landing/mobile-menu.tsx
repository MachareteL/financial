"use client";

import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";

export function MobileMenu() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { session } = useAuth();

  const handleGetStarted = () => {
    if (session) {
      router.push("/dashboard");
    } else {
      router.push("/auth");
    }
  };

  return (
    <>
      <button
        className="md:hidden p-2 text-muted-foreground"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full md:hidden border-t border-border bg-background px-4 py-4 shadow-lg animate-in slide-in-from-top-2">
          <div className="flex flex-col space-y-4">
            <Link
              href="/#features"
              className="text-base font-medium text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Funcionalidades
            </Link>
            <Link
              href="/quiz"
              className="text-base font-medium text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Quiz
            </Link>
            <Link
              href="/#method"
              className="text-base font-medium text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              O Método
            </Link>
            <Link
              href="/#pricing"
              className="text-base font-medium text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Planos
            </Link>
            <Link
              href="/blog"
              className="text-base font-medium text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/auth")}
                className="w-full"
              >
                Login
              </Button>
              <Button onClick={handleGetStarted} className="w-full">
                Começar Agora
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
