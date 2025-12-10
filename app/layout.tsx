import type React from "react";
import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AnalyticsProvider } from "@/components/providers/analytics-provider";
import QueryProvider from "@/components/providers/query-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lemonfinancas.com.br"),
  title: {
    template: "%s | Lemon",
    default: "Lemon | Finanças para Casais que Constroem Juntos",
  },
  description:
    "Planejamento financeiro completo e controle de gastos. A evolução da planilha financeira, perfeito para organização pessoal e finanças para casais.",
  keywords: [
    "planejamento financeiro",
    "controle de gastos",
    "gestão financeira pessoal",
    "finanças para casais",
    "controle financeiro casal",
    "app para casais",
    "educação financeira",
    "gestão financeira compartilhada",
    "juntar finanças",
    "planilha com IA",
    "planilha de gastos casal",
    "planejamento financeiro familiar",
    "b3",
    "imposto de renda",
  ],
  authors: [{ name: "Lemon Financial" }],
  category: "Finance",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Lemon",
    title: "Lemon | Vida financeira com inteligência artificial.",
    description:
      "Gerencie sua vida financeira com inteligência artificial. Lemon ajuda você a organizar suas finanças e metas utilizando o poder da IA. Organize suas finanças em grupo.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Lemon - Finanças Inteligentes.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@lemonfinancas",
    creator: "@lemonfinancas",
    title: "Lemon | Finanças com IA",
    description:
      "Gerencie sua vida financeira com inteligência artificial. Lemon ajuda você a organizar suas finanças e metas utilizando o poder da IA. Organize suas finanças em time!",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} ${dmSans.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AnalyticsProvider>
            <QueryProvider>
              <AuthProvider>{children}</AuthProvider>
            </QueryProvider>
          </AnalyticsProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
