import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Qual é a sua Personalidade Financeira? | Lemon",
  description:
    "Descubra seu Perfil Financeiro e veja como ele combina com o do seu amor. Teste gratuito e rápido para casais.",
  keywords: [
    "teste de perfil financeiro",
    "quiz casal",
    "compatibilidade financeira",
    "arquétipos financeiros",
    "personalidade financeira",
    "finanças a dois",
    "lemon financial quiz",
    "quiz financeiro",
    "quiz de personalidade financeira",
    "quiz de compatibilidade financeira",
    "quiz de arquétipos financeiros",
    "quiz de compatibilidade financeira",
  ],
  openGraph: {
    title: "Qual é a sua vibe com o dinheiro?",
    description:
      "Fiz o teste do Lemon e descobri meu perfil financeiro. Descubra o seu e veja se combinamos!",
    type: "website",
    images: [
      {
        url: "/og-quiz.png", // Assuming specific image or fallback to main
        width: 1200,
        height: 630,
        alt: "Teste de Personalidade Financeira Lemon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Qual é a sua Personalidade Financeira?",
    description: "Descubra seu arquétipo financeiro em 5 minutos.",
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
