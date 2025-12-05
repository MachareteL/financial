import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teste de Personalidade Financeira | Lemon",
  description:
    "Descubra seu perfil financeiro e a compatibilidade com seu parceiro. Faça o teste gratuito do Lemon e entenda sua relação com o dinheiro.",
  keywords: [
    "teste financeiro",
    "personalidade financeira",
    "finanças casais",
    "quiz dinheiro",
    "arquétipo financeiro",
    "lemon financial",
    "teste de personalidade",
    "teste de perfil financeiro",
    "quiz de casal",
  ],
  openGraph: {
    title: "Qual é a sua vibe com o dinheiro? | Lemon",
    description:
      "Descubra seu arquétipo financeiro e a química do seu relacionamento.",
    type: "website",
  },
  alternates: {
    canonical: "https://lemonfinancas.com.br/quiz",
  },
};

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}
