import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/app/auth/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { AnalyticsProvider } from "@/components/providers/analytics-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://lemonfinancas.com.br"),
  title: {
    template: "%s | Lemon",
    default: "Lemon | Finanças para Casais",
  },
  description:
    "Planejamento financeiro completo e controle de gastos. A evolução da planilha financeira, perfeito para organização pessoal e finanças para casais.",
  keywords: [
    "planejamento financeiro",
    "educação financeira",
    "controle de gastos",
    "gestão financeira pessoal",
    "finanças para casais",
    "app casal",
    "planilha de gastos",
    "excel financeiro",
    "b3",
    "imposto de renda",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Lemon",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AnalyticsProvider>
            <AuthProvider>{children}</AuthProvider>
          </AnalyticsProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
