import { Archetype } from "@/domain/entities/quiz/real-questions";

export class GetCoupleInsightUseCase {
  execute(
    profileA: Archetype,
    profileB: Archetype
  ): {
    title: string;
    description: string;
    extendedDescription: string;
    tips: string[];
    compatibilityScore: number;
  } {
    const key = [profileA, profileB].sort().join("+");

    const insights: Record<
      string,
      {
        title: string;
        description: string;
        extendedDescription: string;
        tips: string[];
        compatibilityScore: number;
      }
    > = {
      "Experiencer+Strategist": {
        title: "Freio e Acelerador",
        description:
          "O clássico. Um segura, o outro puxa. Vocês precisam de acordos claros para não gerar frustração.",
        extendedDescription:
          "Essa é uma das combinações mais poderosas e, ao mesmo tempo, explosivas. O Estrategista traz a estrutura que falta ao Bon Vivant, enquanto o Bon Vivant lembra o Estrategista de que a vida acontece fora da planilha. O segredo aqui é não tentar mudar a essência do outro, mas sim valorizar o contraponto.",
        tips: [
          'Definam um "Orçamento da Alegria" mensal que o Bon Vivant pode gastar sem dar satisfação.',
          "O Estrategista deve apresentar os números focando nos sonhos que eles realizam, não apenas na restrição.",
          "Façam reuniões financeiras curtas e com vinho/cerveja para deixar o clima leve.",
        ],
        compatibilityScore: 85,
      },
      "Builder+Minimalist": {
        title: "Ousadia com Segurança",
        description:
          "Ótima dupla para construir patrimônio sólido. O Visionário expande, o Zen protege.",
        extendedDescription:
          "O Visionário quer conquistar o mundo, o Zen quer garantir que o castelo não desmorone. Juntos, vocês são imbatíveis. O Minimalista garante que o Visionário tenha uma base sólida para saltar, e o Visionário impede que o Minimalista estagne no conforto.",
        tips: [
          'O Visionário deve sempre mostrar o "pior cenário" calculado para acalmar o Minimalista.',
          'O Minimalista deve aceitar separar uma parte do capital para "risco total" do Visionário.',
          "Celebrem cada marco de segurança atingido antes de dar o próximo passo arriscado.",
        ],
        compatibilityScore: 92,
      },
      "Builder+Strategist": {
        title: "Império Planejado",
        description:
          "Potencial incrível de crescimento, mas cuidado para não viverem apenas no futuro.",
        extendedDescription:
          "Duas mentes focadas no amanhã. Vocês falam a mesma língua dos números e do crescimento. O perigo é transformarem o relacionamento em uma empresa S.A. e esquecerem de desfrutar os dividendos emocionais hoje.",
        tips: [
          "Obriguem-se a ter hobbies que custam dinheiro e não dão retorno financeiro.",
          'Cuidado com a competição interna de "quem investe melhor".',
          "Planejem as férias com a mesma dedicação que planejam a aposentadoria.",
        ],
        compatibilityScore: 88,
      },
      "Experiencer+Minimalist": {
        title: "Equilíbrio Vital",
        description:
          "O Bon Vivant ensina o Zen a aproveitar, e o Zen ensina o Bon Vivant a ter paz.",
        extendedDescription:
          'O Minimalista pode achar o Bon Vivant irresponsável, e o Bon Vivant pode achar o Minimalista "pão-duro". A verdade é que vocês são o remédio um do outro. O Minimalista precisa de cor para a vida, e o Bon Vivant precisa de chão.',
        tips: [
          "O Minimalista deve focar no valor da experiência, não no preço.",
          "O Bon Vivant deve provar que consegue poupar para um objetivo específico.",
          "Criem metas compartilhadas que unam segurança e prazer (ex: casa na praia).",
        ],
        compatibilityScore: 78,
      },
      "Builder+Experiencer": {
        title: "Vida Adrenalina",
        description:
          "Muitos projetos e muitas viagens. Cuidado com a reserva de emergência!",
        extendedDescription:
          "Haja coração (e limite no cartão)! O Visionário quer investir tudo na empresa, o Bon Vivant quer gastar tudo na viagem. Ambos têm alta propensão ao risco e ao gasto. Se não houver disciplina, podem ganhar muito e não ter nada.",
        tips: [
          'Automatizem os investimentos e as contas fixas para "salvar vocês de vocês mesmos".',
          "Tenham contas separadas para gastos pessoais para evitar brigas.",
          'Contratem um consultor financeiro para ser o "adulto chato" da sala.',
        ],
        compatibilityScore: 70,
      },
      "Minimalist+Strategist": {
        title: "Fortaleza Financeira",
        description:
          "Risco zero de dívidas, mas talvez faltem algumas aventuras na memória.",
        extendedDescription:
          "A casa mais segura do bairro. Vocês nunca vão falir, mas podem morrer de tédio financeiro. A sintonia é perfeita na economia, mas pode faltar aquele empurrão para viver experiências transformadoras que custam caro.",
        tips: [
          'Desafiem-se a gastar 10% da renda líquida em "futilidades" ou experiências novas.',
          "Não deixem o dinheiro ser o único assunto do casal.",
          "Permitam-se comprar itens de alta qualidade e preço, não apenas o mais barato.",
        ],
        compatibilityScore: 95,
      },
      // Same archetype combinations
      "Strategist+Strategist": {
        title: "Dupla Planilha",
        description:
          "Controle total. O desafio é relaxar e gastar com o que importa.",
        extendedDescription:
          "Vocês têm planilhas integradas no Google Sheets, não têm? A eficiência é máxima, mas o relacionamento não pode ser um KPI. Cuidado para não microgerenciarem um ao outro.",
        tips: [
          "Proibido falar de dinheiro nos finais de semana (salvo emergências).",
          'Usem a eficiência para "comprar tempo" de qualidade juntos.',
          "Aceitem que nem tudo precisa de ROI positivo.",
        ],
        compatibilityScore: 90,
      },
      "Experiencer+Experiencer": {
        title: "Só se vive uma vez",
        description:
          "Diversão garantida, mas alguém precisa ser o adulto da relação financeira.",
        extendedDescription:
          'A vida com vocês é uma festa. O Instagram é lindo. A fatura do cartão... nem tanto. O risco de colapso financeiro é real se não houver um "freio de mão" externo.',
        tips: [
          "Débito automático é a salvação de vocês.",
          'Tenham um dia do mês "chato" para encarar a realidade financeira.',
          "Considerem ter uma conta conjunta apenas para as despesas da casa, blindada.",
        ],
        compatibilityScore: 80,
      },
      "Builder+Builder": {
        title: "Foguete sem Ré",
        description: "Crescimento exponencial, mas o risco também é dobrado.",
        extendedDescription:
          "Dois Visionários juntos podem conquistar o mundo ou quebrar tentando. A ambição é o combustível, mas quem está olhando para o paraquedas? Apoiem os sonhos um do outro, mas validem a viabilidade.",
        tips: [
          "Diversifiquem! Não coloquem todos os ovos na mesma cesta (ou no mesmo negócio).",
          'Estabeleçam um "teto de risco" que não pode ser ultrapassado.',
          "Lembrem-se de celebrar as pequenas vitórias, não só o IPO.",
        ],
        compatibilityScore: 85,
      },
      "Minimalist+Minimalist": {
        title: "Paz Absoluta",
        description: "Segurança máxima. Que tal ousar um pouquinho mais?",
        extendedDescription:
          "Vocês entendem profundamente a necessidade de segurança do outro. O risco de brigas por dinheiro é zero. O risco de estagnação é alto. Vocês podem passar a vida acumulando para um futuro que nunca chega.",
        tips: [
          'Criem um "Fundo de Ousadia" para investimentos ou viagens mais arriscadas.',
          "Doem ou invistam em causas que acreditam para dar movimento ao dinheiro.",
          'Troquem o "não precisamos disso" por "isso nos traria alegria?".',
        ],
        compatibilityScore: 98,
      },
    };

    return (
      insights[key] || {
        title: "Combinação Única",
        description:
          "Vocês têm uma dinâmica própria. O importante é o diálogo aberto sobre dinheiro.",
        extendedDescription:
          "Sua combinação é rara e especial. Usem o diálogo para entender os pontos fortes e fracos de cada um.",
        tips: [
          "Conversem abertamente.",
          "Respeitem as diferenças.",
          "Criem objetivos comuns.",
        ],
        compatibilityScore: 50,
      }
    );
  }
}
