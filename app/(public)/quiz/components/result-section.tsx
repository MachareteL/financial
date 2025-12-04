import { ARCHETYPES, Archetype } from "@/domain/entities/quiz/real-questions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Share2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Heart,
  Zap,
  Shield,
  Target,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useEffect, useState } from "react";
import { QuizResult } from "../_use-case/calculate-lifestyle.use-case";
import { cn } from "@/lib/utils";
import { generateWhatsAppLink } from "../utils/share-utils";

interface ResultSectionProps {
  result: QuizResult;
  coupleResult?: {
    title: string;
    description: string;
    extendedDescription: string;
    tips: string[];
    compatibilityScore: number;
  } | null;
  onRetake: () => void;
}

const ARCHETYPE_THEME_COLORS: Record<
  Archetype,
  {
    bg: string;
    text: string;
    border: string;
    icon: string;
    gradient: string;
  }
> = {
  Strategist: {
    bg: "bg-info/10",
    text: "text-info",
    border: "border-info/20",
    icon: "text-info",
    gradient: "from-info/20 to-info/5",
  },
  Experiencer: {
    bg: "bg-warning/10",
    text: "text-warning",
    border: "border-warning/20",
    icon: "text-warning",
    gradient: "from-warning/20 to-warning/5",
  },
  Builder: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20",
    icon: "text-primary",
    gradient: "from-primary/20 to-primary/5",
  },
  Minimalist: {
    bg: "bg-success/10",
    text: "text-success",
    border: "border-success/20",
    icon: "text-success",
    gradient: "from-success/20 to-success/5",
  },
};

export function ResultSection({
  result: quizResult,
  coupleResult,
  onRetake,
}: ResultSectionProps) {
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype>(
    quizResult.archetype
  );
  const archetypeData = ARCHETYPES[selectedArchetype];
  const themeColors = ARCHETYPE_THEME_COLORS[selectedArchetype];
  const [activeTab, setActiveTab] = useState<string>("profile");

  // Reset selected archetype when result changes
  useEffect(() => {
    setSelectedArchetype(quizResult.archetype);
  }, [quizResult.archetype]);

  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: NodeJS.Timeout = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  // Switch to couple tab automatically if couple result is present
  useEffect(() => {
    if (coupleResult) {
      setActiveTab("couple");
    }
  }, [coupleResult]);

  const handleShare = () => {
    const text = `Descobri que meu arquétipo financeiro é ${ARCHETYPES[quizResult.archetype].title}! 🍋 ${ARCHETYPES[quizResult.archetype].motto}`;
    const url = window.location.href;

    if (navigator.share) {
      navigator
        .share({
          title: "Meu DNA Financeiro - Lemon",
          text: text,
          url: url,
        })
        .catch(console.error);
    } else {
      window.open(generateWhatsAppLink(text, url), "_blank");
    }
  };

  const getLemonBenefit = (type: Archetype) => {
    switch (type) {
      case "Strategist":
        return "O Lemon automatiza a coleta de dados para que você foque na análise, não na digitação. Seus relatórios, prontos em segundos.";
      case "Experiencer":
        return "O Lemon organiza tudo automaticamente. Você vive o momento, nós cuidamos do registro. Sem culpa, com controle.";
      case "Builder":
        return "Monitore seu patrimônio em tempo real. Gráficos de evolução, alocação de ativos e metas de crescimento em um só lugar.";
      case "Minimalist":
        return "Segurança e simplicidade. Veja todas as suas contas em uma tela só e garanta que sua reserva está protegida e rendendo.";
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-20 px-4 md:px-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {coupleResult && (
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-14 bg-muted/50 p-1.5 rounded-full">
              <TabsTrigger
                value="profile"
                className="rounded-full text-sm md:text-base font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
              >
                Meu Perfil
              </TabsTrigger>
              <TabsTrigger
                value="couple"
                className="relative rounded-full text-sm md:text-base font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
              >
                Dinâmica do Casal{" "}
                <span className="absolute -top-4 -right-4 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold border border-primary/20 flex items-center">
                  NOVO
                </span>
              </TabsTrigger>
            </TabsList>
          </div>
        )}

        <TabsContent
          value="profile"
          className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <Card className="h-full border-none shadow-elevated overflow-hidden bg-card relative flex flex-col">
                <div
                  className={`h-4 w-full ${themeColors.bg.replace("/10", "")}`}
                />
                <CardHeader className="text-center pb-2 pt-8 md:pt-10 relative z-10 flex-1 px-6">
                  <div
                    className={cn(
                      "mx-auto mb-6 w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center text-5xl md:text-6xl shadow-inner bg-muted/30",
                      themeColors.bg
                    )}
                  >
                    🍋
                  </div>
                  <CardTitle className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tight">
                    {archetypeData.title}
                  </CardTitle>
                  <p className="text-base md:text-lg text-muted-foreground font-medium mt-4 italic">
                    {archetypeData.motto}
                  </p>
                </CardHeader>
                <CardContent className="text-center pb-6 md:pb-8 px-6">
                  <div
                    className={cn(
                      "p-5 md:p-6 rounded-xl border mt-4 md:mt-6",
                      themeColors.bg,
                      themeColors.border
                    )}
                  >
                    <p className="text-sm md:text-base font-semibold text-foreground">
                      {archetypeData.pitch}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="p-6 md:p-8 pt-0 mt-auto">
                  <Button
                    size="lg"
                    className="w-full font-bold h-12 shadow-button text-base md:text-lg"
                    onClick={handleShare}
                  >
                    <Share2 className="mr-2 h-5 w-5" />
                    Compartilhar Resultado
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
              <div className="bg-card rounded-3xl p-6 md:p-8 shadow-sm border border-border/50">
                <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-warning" />
                  Quem é você no dinheiro?
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed mb-6">
                  {archetypeData.fullDescription}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2 text-success">
                      <Zap className="w-5 h-5" /> Seus Superpoderes
                    </h3>
                    <ul className="space-y-3">
                      {archetypeData.strengths.map((strength, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-foreground/80"
                        >
                          <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2 text-warning">
                      <AlertTriangle className="w-5 h-5" /> Pontos de Atenção
                    </h3>
                    <ul className="space-y-3">
                      {archetypeData.blindSpots.map((spot, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-foreground/80"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-warning mt-2 shrink-0" />
                          {spot}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Lemon CTA */}
              <div className="bg-gradient-to-r from-primary/90 to-primary text-primary-foreground rounded-3xl p-6 md:p-8 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Shield className="w-32 h-32 md:w-48 md:h-48" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl md:text-2xl font-bold mb-2">
                    O Lemon é o aliado perfeito para {archetypeData.title}
                  </h3>
                  <p className="text-primary-foreground/90 text-base md:text-lg mb-6 leading-relaxed max-w-xl">
                    {getLemonBenefit(selectedArchetype)}
                  </p>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full sm:w-auto font-bold shadow-lg hover:shadow-xl transition-all text-primary"
                  >
                    Criar minha conta grátis
                  </Button>
                </div>
              </div>

              {/* Other Archetypes Context */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                {(Object.keys(ARCHETYPES) as Archetype[]).map((type) => {
                  const data = ARCHETYPES[type];
                  const colors = ARCHETYPE_THEME_COLORS[type];
                  const isSelected = type === selectedArchetype;
                  const isMyResult = type === quizResult.archetype;

                  return (
                    <div
                      key={type}
                      onClick={() => setSelectedArchetype(type)}
                      className={cn(
                        "p-3 md:p-4 rounded-xl border text-center transition-all cursor-pointer relative",
                        isSelected
                          ? cn(
                              "ring-2 scale-105 shadow-md",
                              colors.bg,
                              colors.border,
                              colors.text.replace("text-", "ring-")
                            )
                          : "bg-card border-transparent opacity-70 hover:opacity-100 hover:bg-muted/50"
                      )}
                    >
                      {isMyResult && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap z-10">
                          Seu Resultado
                        </div>
                      )}
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full mx-auto mb-2",
                          colors.bg.replace("/10", "")
                        )}
                      />
                      <p className="font-bold text-[10px] md:text-xs uppercase tracking-wider mb-1">
                        {type}
                      </p>
                      <p className="text-[10px] text-muted-foreground line-clamp-2">
                        {data.title}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        {coupleResult && (
          <TabsContent
            value="couple"
            className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500"
          >
            <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/20 rounded-[2rem] p-6 md:p-12 border border-primary/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 md:p-12 opacity-5">
                <Heart className="w-32 h-32 md:w-64 md:h-64" />
              </div>

              <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
                <Badge
                  variant="secondary"
                  className="mb-4 px-4 py-1 text-sm font-medium bg-background/80 backdrop-blur-sm shadow-sm"
                >
                  Compatibilidade: {coupleResult.compatibilityScore}%
                </Badge>

                <h2 className="text-3xl md:text-4xl lg:text-6xl font-black text-foreground tracking-tight">
                  {coupleResult.title}
                </h2>

                <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground font-light max-w-2xl mx-auto">
                  {coupleResult.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-8 md:mt-12 text-left">
                  <div className="md:col-span-2 bg-background/60 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-sm border border-border/50">
                    <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Análise da Química
                    </h3>
                    <p className="text-sm md:text-base text-foreground/80 leading-relaxed">
                      {coupleResult.extendedDescription}
                    </p>
                  </div>

                  <div className="bg-primary/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-primary/10">
                    <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2 text-primary">
                      <Shield className="w-5 h-5" />
                      Dicas de Ouro
                    </h3>
                    <ul className="space-y-4">
                      {coupleResult.tips.map((tip, i) => (
                        <li
                          key={i}
                          className="text-sm text-foreground/90 flex gap-3"
                        >
                          <span className="font-bold text-primary/50">
                            {i + 1}.
                          </span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Couple CTA */}
                <div className="mt-8 md:mt-12 bg-card rounded-2xl p-6 md:p-8 border border-border/50 shadow-sm text-center">
                  <h3 className="text-lg md:text-xl font-bold mb-2">
                    Querem construir esse futuro juntos?
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-6">
                    O Lemon tem ferramentas compartilhadas para casais como
                    vocês.
                  </p>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto font-bold shadow-button"
                  >
                    Criar conta para o Casal
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={onRetake}
                className="w-full sm:w-auto"
              >
                Refazer Teste
              </Button>
              <Button
                size="lg"
                className="w-full sm:w-auto font-bold shadow-button"
                onClick={handleShare}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Compartilhar Resultado do Casal
              </Button>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
