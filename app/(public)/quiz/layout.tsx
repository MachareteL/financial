import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Qual é o seu perfil financeiro? Teste agora!",
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
    title: "Qual é o seu perfil financeiro?",
    description:
      "Faça o teste de perfil gratuito! Descubra seu arquétipo financeiro. Individual ou em dupla!",
    type: "website",
    url: "https://lemonfinancas.com.br/quiz",
  },
  twitter: {
    card: "summary_large_image",
    title: "Qual é o seu arquétipo financeiro?",
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
