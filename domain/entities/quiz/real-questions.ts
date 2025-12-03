export type Archetype = "Strategist" | "Experiencer" | "Builder" | "Minimalist";

export interface QuizOption {
  id: string;
  text: string;
  archetype: Archetype;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
}

export const ARCHETYPES: Record<
  Archetype,
  {
    title: string;
    subtitle: string;
    pitch: string;
    color: string;
    motto: string;
    fullDescription: string;
    strengths: string[];
    blindSpots: string[];
  }
> = {
  Strategist: {
    title: "O Estrategista",
    subtitle: "Seu superpoder é a previsibilidade. Seu ponto cego é a rigidez.",
    pitch: "Te damos o controle absoluto sem você precisar abrir o Excel.",
    color: "bg-blue-500",
    motto: '"Se não pode ser medido, não pode ser gerenciado."',
    fullDescription:
      "Você é a âncora financeira. Enquanto o mundo gira no caos, sua planilha permanece imaculada. Para você, dinheiro não é sobre emoção, é sobre lógica, dados e otimização. Você encontra paz na previsibilidade e sente um prazer quase físico ao ver as contas batendo centavo por centavo.",
    strengths: [
      "Visão de longo prazo impecável",
      "Disciplina inabalável",
      "Habilidade natural para encontrar ineficiências",
    ],
    blindSpots: [
      'Dificuldade em gastar com prazeres "irracionais"',
      "Pode paralisar por excesso de análise",
      "Tende a julgar quem é menos organizado",
    ],
  },
  Experiencer: {
    title: "O Bon Vivant",
    subtitle: "Você prioriza o hoje. Cuidado para não esquecer do amanhã.",
    pitch: "Viva bem, mas saiba o limite. Te avisamos quando parar.",
    color: "bg-yellow-500",
    motto: '"A vida é agora. O dinheiro é apenas o meio."',
    fullDescription:
      "Você entende que o caixão não tem gaveta. Sua relação com o dinheiro é fluida e generosa. Você investe em memórias, sensações e conexões. Para você, um saldo bancário alto sem histórias para contar é apenas um número triste em um servidor.",
    strengths: [
      "Sabe aproveitar o melhor da vida",
      "Generosidade natural",
      "Não se torna escravo do dinheiro",
    ],
    blindSpots: [
      "Tendência a ignorar o futuro distante",
      "Gastos impulsivos baseados em emoção",
      "Dificuldade em construir reservas de emergência",
    ],
  },
  Builder: {
    title: "O Visionário",
    subtitle: "Focado em multiplicar. Aceita risco para mudar de patamar.",
    pitch: "Monitore a evolução do seu patrimônio em tempo real.",
    color: "bg-purple-500",
    motto: '"Risco é o preço da oportunidade."',
    fullDescription:
      "Você não quer apenas preservar, você quer multiplicar. O status quo te incomoda. Você vê o dinheiro como uma ferramenta de alavancagem para construir impérios, sejam eles grandes ou pequenos. A segurança do CDB te dá sono; a volatilidade da oportunidade te dá energia.",
    strengths: [
      "Coragem para tomar decisões difíceis",
      "Foco em crescimento exponencial",
      "Resiliência a perdas de curto prazo",
    ],
    blindSpots: [
      "Pode negligenciar a segurança básica",
      "Ansiedade por resultados rápidos",
      'Risco de "dar um passo maior que a perna"',
    ],
  },
  Minimalist: {
    title: "O Zen",
    subtitle: "Paz de espírito acima de tudo. Simplicidade é o seu lema.",
    pitch:
      "Segurança automatizada. Durma tranquilo sabendo que está tudo azul.",
    color: "bg-green-500",
    motto: '"Menos é mais. Paz é lucro."',
    fullDescription:
      "Você busca a liberdade através da simplicidade. Não é sobre escassez, é sobre suficiência. Você dorme tranquilo porque sabe que não precisa de muito para ser feliz. Dívidas são seus piores pesadelos e sua reserva de emergência é seu templo sagrado.",
    strengths: [
      "Imunidade ao consumismo desenfreado",
      "Estabilidade emocional financeira",
      "Capacidade de viver bem com pouco",
    ],
    blindSpots: [
      "Pode perder oportunidades por excesso de cautela",
      "Medo irracional de escassez",
      "Dificuldade em investir em si mesmo",
    ],
  },
};

export const REAL_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    text: "Sobrou R$ 2.000,00 no fim do mês. O que você faz?",
    options: [
      {
        id: "a",
        text: "Jogo tudo no investimento que rende mais.",
        archetype: "Builder",
      },
      {
        id: "b",
        text: "Deixo na conta, vai que o carro quebra.",
        archetype: "Minimalist",
      },
      {
        id: "c",
        text: "Compro aquela passagem em promoção.",
        archetype: "Experiencer",
      },
      {
        id: "d",
        text: "Abato uma parcela futura do financiamento.",
        archetype: "Strategist",
      },
    ],
  },
  {
    id: "q2",
    text: "Você recebeu um bônus inesperado da empresa. Qual o primeiro pensamento?",
    options: [
      {
        id: "a",
        text: "Já sei exatamente onde investir para render mais.",
        archetype: "Builder",
      },
      {
        id: "b",
        text: "Vou guardar, nunca se sabe o dia de amanhã.",
        archetype: "Minimalist",
      },
      {
        id: "c",
        text: "Hora de trocar de celular ou fazer aquela viagem!",
        archetype: "Experiencer",
      },
      {
        id: "d",
        text: "Atualizo minha planilha e defino o destino de cada centavo.",
        archetype: "Strategist",
      },
    ],
  },
  {
    id: "q3",
    text: "Como você lida com a fatura do cartão de crédito?",
    options: [
      {
        id: "a",
        text: "Uso para acumular milhas e benefícios, pago sempre em dia.",
        archetype: "Builder",
      },
      {
        id: "b",
        text: "Evito usar. Prefiro débito ou Pix para não ter surpresa.",
        archetype: "Minimalist",
      },
      {
        id: "c",
        text: "Às vezes me assusto, mas a vida é uma só.",
        archetype: "Experiencer",
      },
      {
        id: "d",
        text: "Sei exatamente quanto virá, acompanho gasto por gasto.",
        archetype: "Strategist",
      },
    ],
  },
  {
    id: "q4",
    text: "Seu parceiro(a) sugere um jantar caro em uma terça-feira. Você:",
    options: [
      {
        id: "a",
        text: 'Analiso se cabe no orçamento de "lazer" do mês.',
        archetype: "Strategist",
      },
      {
        id: "b",
        text: "Topo! Vamos aproveitar o momento.",
        archetype: "Experiencer",
      },
      {
        id: "c",
        text: "Sugiro algo mais em conta ou cozinhar em casa.",
        archetype: "Minimalist",
      },
      {
        id: "d",
        text: 'Penso: "Esse dinheiro poderia estar rendendo..."',
        archetype: "Builder",
      },
    ],
  },
  {
    id: "q5",
    text: "Qual é o seu maior medo financeiro?",
    options: [
      {
        id: "a",
        text: "Perder o controle das minhas finanças.",
        archetype: "Strategist",
      },
      {
        id: "b",
        text: "Não aproveitar a vida enquanto tenho saúde.",
        archetype: "Experiencer",
      },
      {
        id: "c",
        text: "Ficar sem dinheiro em uma emergência.",
        archetype: "Minimalist",
      },
      {
        id: "d",
        text: "Perder oportunidades de multiplicar meu patrimônio.",
        archetype: "Builder",
      },
    ],
  },
  {
    id: "q6",
    text: 'Para você, o que significa "sucesso financeiro"?',
    options: [
      {
        id: "a",
        text: "Ter tudo organizado e previsível.",
        archetype: "Strategist",
      },
      {
        id: "b",
        text: "Poder viver experiências incríveis sem culpa.",
        archetype: "Experiencer",
      },
      { id: "c", text: "Ter paz e zero dívidas.", archetype: "Minimalist" },
      {
        id: "d",
        text: "Liberdade para fazer o que quiser, quando quiser.",
        archetype: "Builder",
      },
    ],
  },
];
