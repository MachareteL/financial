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
    title: "O Arquiteto",
    subtitle:
      "Planejamento é sua linguagem de amor. O futuro é construído hoje.",
    pitch:
      "Você não gasta, você aloca recursos. O caos financeiro não tem vez com você.",
    color: "bg-blue-500",
    motto: '"Sorte é o encontro da preparação com a oportunidade."',
    fullDescription:
      "Você é o mestre da estrutura. Enquanto a maioria reage aos boletos, você já previu, categorizou e pagou com desconto. Para você, dinheiro é uma ferramenta de construção de vida, não apenas papel. Você dorme tranquilo não porque tem muito, mas porque tem controle.",
    strengths: [
      "Visão de longo prazo cristalina",
      "Habilidade de transformar metas em planos acionáveis",
      "Imunidade a compras por impulso",
    ],
    blindSpots: [
      "Pode esquecer de curtir o presente por focar demais no futuro",
      "Tende a ser rígido com mudanças de planos",
      "Risco de ver o dinheiro como fim, não meio",
    ],
  },
  Experiencer: {
    title: "O Espírito Livre",
    subtitle: "Colecionador de momentos, não de coisas. A vida acontece agora.",
    pitch: "O dinheiro serve para criar memórias. O resto é detalhe.",
    color: "bg-yellow-500",
    motto:
      '"A única coisa que a gente leva da vida é a vida que a gente leva."',
    fullDescription:
      "Você entende que o valor das coisas está na experiência que elas proporcionam. Seja um jantar incrível ou uma viagem de última hora, você não tem medo de usar o dinheiro para viver bem. Seu desafio é garantir que o 'eu do futuro' também possa curtir tanto quanto o 'eu de hoje'.",
    strengths: [
      "Sabe priorizar o que realmente traz felicidade",
      "Generosidade e facilidade em compartilhar",
      "Não sofre por acumulação desnecessária",
    ],
    blindSpots: [
      "O 'eu do futuro' muitas vezes fica esquecido",
      "Dificuldade com rotinas financeiras chatas",
      "Risco de confundir desejo com necessidade",
    ],
  },
  Builder: {
    title: "O Impulsionador",
    subtitle:
      "Inquieto por natureza. Onde os outros veem risco, você vê chance.",
    pitch: "Crescer é a única opção. Estagnação é seu maior pesadelo.",
    color: "bg-purple-500",
    motto: '"Quem não arrisca, não petisca (e não enriquece)."',
    fullDescription:
      "Você tem um motor interno ligado no 220v. Dinheiro parado te incomoda fisicamente. Você está sempre buscando a próxima alavanca, o próximo projeto, a próxima forma de multiplicar. Sua ambição é sua maior aliada, mas cuidado para não tropeçar na própria velocidade.",
    strengths: [
      "Faro apurado para oportunidades",
      "Coragem para tomar decisões difíceis",
      "Foco em multiplicação e escala",
    ],
    blindSpots: [
      "Pode negligenciar a segurança básica",
      "Ansiedade quando os resultados demoram",
      "Tendência a dar passos maiores que a perna",
    ],
  },
  Minimalist: {
    title: "O Essencialista",
    subtitle: "Menos barulho, mais paz. A sofisticação está na simplicidade.",
    pitch: "Sua riqueza é medida pela sua tranquilidade, não pelos seus bens.",
    color: "bg-green-500",
    motto: '"Não é sobre ter pouco, é sobre ter o suficiente."',
    fullDescription:
      "Você descobriu o segredo que a maioria ignora: a liberdade custa menos do que parece. Você valoriza a paz de espírito acima de qualquer status. Sua vida financeira é leve, descomplicada e incrivelmente resiliente. Enquanto o mundo corre atrás de 'mais', você está feliz com o 'melhor'.",
    strengths: [
      "Imunidade quase total ao consumismo",
      "Alta capacidade de poupança e resiliência",
      "Clareza sobre o que é realmente importante",
    ],
    blindSpots: [
      "Pode perder oportunidades por excesso de cautela",
      "Risco de viver com menos do que poderia/merece",
      "Dificuldade em investir em confortos que facilitam a vida",
    ],
  },
};

export const REAL_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    text: "Sua banda favorita anunciou um show surpresa na sua cidade, mas o ingresso é salgado. Você:",
    options: [
      {
        id: "a",
        text: "Compro na hora! Parcelo em 12x, mas não perco essa memória.",
        archetype: "Experiencer",
      },
      {
        id: "b",
        text: "Analiso meu fluxo de caixa do mês. Se couber sem comprometer as metas, eu vou.",
        archetype: "Strategist",
      },
      {
        id: "c",
        text: "Penso: 'Com esse valor eu poderia investir em algo que me dê retorno real'.",
        archetype: "Builder",
      },
      {
        id: "d",
        text: "Provavelmente não vou. Prefiro ouvir no Spotify e economizar essa grana.",
        archetype: "Minimalist",
      },
    ],
  },
  {
    id: "q2",
    text: "Caiu um bônus inesperado na conta da empresa (milagre!). O primeiro pensamento é:",
    options: [
      {
        id: "a",
        text: "Já sei exatamente onde alocar para acelerar minha independência financeira.",
        archetype: "Builder",
      },
      {
        id: "b",
        text: "Vou guardar na reserva. Segurança em primeiro lugar, sempre.",
        archetype: "Minimalist",
      },
      {
        id: "c",
        text: "Hora de trocar de celular ou fazer aquela viagem que estava namorando!",
        archetype: "Experiencer",
      },
      {
        id: "d",
        text: "Atualizo minha planilha e defino o destino de cada centavo estrategicamente.",
        archetype: "Strategist",
      },
    ],
  },
  {
    id: "q3",
    text: "Um parente próximo pede R$ 500 emprestado com aquela história triste. Sua reação:",
    options: [
      {
        id: "a",
        text: "Empresto (ou dou) se tiver. Família é para essas coisas.",
        archetype: "Experiencer",
      },
      {
        id: "b",
        text: "Empresto, mas já mentalizo que esse dinheiro provavelmente não volta.",
        archetype: "Minimalist",
      },
      {
        id: "c",
        text: "Avalio se é uma emergência real. Se for desorganização, prefiro ajudar a organizar as contas.",
        archetype: "Strategist",
      },
      {
        id: "d",
        text: "Proponho uma forma dele fazer esse dinheiro extra trabalhando ou vendendo algo.",
        archetype: "Builder",
      },
    ],
  },
  {
    id: "q4",
    text: "Dia de pagar a fatura do cartão de crédito. Qual é a sensação?",
    options: [
      {
        id: "a",
        text: "Satisfação. Tudo sob controle, pontos acumulados e pago em dia.",
        archetype: "Strategist",
      },
      {
        id: "b",
        text: "Alívio por não ter gastado quase nada. Odeio depender de crédito.",
        archetype: "Minimalist",
      },
      {
        id: "c",
        text: "Um leve mini-infarto, mas valeu a pena cada jantar e comprinha.",
        archetype: "Experiencer",
      },
      {
        id: "d",
        text: "Indiferença. É só uma ferramenta de fluxo de caixa para meus planos maiores.",
        archetype: "Builder",
      },
    ],
  },
  {
    id: "q5",
    text: "O crush sugere um restaurante Michelin numa terça-feira comum. Você:",
    options: [
      {
        id: "a",
        text: "Topo! Experiências gastronômicas são prioridade pra mim.",
        archetype: "Experiencer",
      },
      {
        id: "b",
        text: "Sugiro algo mais em conta ou cozinhar um jantar especial em casa.",
        archetype: "Minimalist",
      },
      {
        id: "c",
        text: "Vejo se tenho 'budget de lazer' disponível. Se tiver, vamos.",
        archetype: "Strategist",
      },
      {
        id: "d",
        text: "Penso: 'Esse jantar custa 5 ações daquela empresa que eu quero comprar...'",
        archetype: "Builder",
      },
    ],
  },
  {
    id: "q6",
    text: "Black Friday chegou. Você recebe 50 e-mails de promoção. Você:",
    options: [
      {
        id: "a",
        text: "Já tenho minha lista de desejos pronta e monitorada há meses. Só compro o planejado.",
        archetype: "Strategist",
      },
      {
        id: "b",
        text: "Ignoro tudo. Se eu precisasse, já teria comprado. Não caio em hype.",
        archetype: "Minimalist",
      },
      {
        id: "c",
        text: "Aproveito para comprar coisas que vão me ajudar a ganhar mais dinheiro ou produtividade.",
        archetype: "Builder",
      },
      {
        id: "d",
        text: "Dou uma olhada... vai que tem aquela passagem ou aquele tênis num preço imperdível?",
        archetype: "Experiencer",
      },
    ],
  },
  {
    id: "q7",
    text: "Como você planeja suas férias?",
    options: [
      {
        id: "a",
        text: "Planilha detalhada: roteiro, custos diários, reservas com antecedência máxima.",
        archetype: "Strategist",
      },
      {
        id: "b",
        text: "Defino o destino e vou. Gosto de deixar a vida me levar e decidir lá.",
        archetype: "Experiencer",
      },
      {
        id: "c",
        text: "Busco destinos baratos ou fico em casa relaxando. Férias é para descansar, não gastar.",
        archetype: "Minimalist",
      },
      {
        id: "d",
        text: "Busco um lugar que me inspire ou onde eu possa fazer networking/aprender algo novo.",
        archetype: "Builder",
      },
    ],
  },
  {
    id: "q8",
    text: "Para você, o que significa 'sucesso financeiro'?",
    options: [
      {
        id: "a",
        text: "Liberdade total de agenda. Fazer o que quiser, quando quiser.",
        archetype: "Builder",
      },
      {
        id: "b",
        text: "Poder viver experiências incríveis sem culpa e sem contar moedas.",
        archetype: "Experiencer",
      },
      {
        id: "c",
        text: "Dormir com a cabeça tranquila, zero dívidas e dinheiro na conta.",
        archetype: "Minimalist",
      },
      {
        id: "d",
        text: "Ter a vida organizada, previsível e segura para minha família.",
        archetype: "Strategist",
      },
    ],
  },
];
