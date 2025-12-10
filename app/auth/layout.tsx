import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Lemon",
  description:
    "Faça login ou crie sua conta no Lemon. Gerencie sua vida financeira com inteligência artificial.",
  openGraph: {
    title: "Login | Lemon",
    description:
      "Faça login ou crie sua conta no Lemon. Gerencie sua vida financeira com inteligência artificial.",
    type: "website",
    url: "https://lemonfinancas.com.br/auth",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
