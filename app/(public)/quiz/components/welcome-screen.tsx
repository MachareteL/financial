import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import {
  User,
  Users,
  Sparkles,
  Brain,
  Heart,
  TrendingUp,
  ArrowRight,
  Star,
} from "lucide-react";
import { ARCHETYPES, Archetype } from "@/domain/entities/quiz/real-questions";
import Image from "next/image";

interface WelcomeScreenProps {
  onStartSolo: () => void;
  onStartMultiplayer: () => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function WelcomeScreen({
  onStartSolo,
  onStartMultiplayer,
}: WelcomeScreenProps) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-20">
      {/* Hero Section */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="text-center mb-20 pt-10"
      >
        <motion.div variants={item} className="flex justify-center mb-6">
          <Badge
            variant="secondary"
            className="px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border-primary/20 backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5 mr-2 inline-block" />
            Tendência entre casais modernos
          </Badge>
        </motion.div>

        <motion.h1
          variants={item}
          className="text-5xl md:text-7xl font-black tracking-tight text-foreground mb-6 leading-[1.1]"
        >
          Qual é a sua <br className="hidden md:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-secondary animate-gradient">
            sintonia financeira?
          </span>
        </motion.h1>

        <motion.p
          variants={item}
          className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-10"
        >
          Dinheiro não é só matemática, é comportamento. Descubra seu{" "}
          <strong>DNA Financeiro</strong> e entenda a química real entre você e
          seu amor.
        </motion.p>

        <motion.div
          variants={item}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto"
        >
          {/* Solo Mode Card */}
          <Card
            className="h-full hover:border-primary/50 transition-all cursor-pointer group relative overflow-hidden border-2 hover:shadow-xl bg-card/50 backdrop-blur-sm"
            onClick={onStartSolo}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="pb-2">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner mx-auto">
                <User className="w-7 h-7 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Descobrir meu perfil
              </CardTitle>
              <CardDescription className="text-base">
                Autoconhecimento em 2 minutos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full font-bold group-hover:translate-x-1 transition-transform h-12 text-lg"
                variant="outline"
              >
                Começar Jornada <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Multiplayer Mode Card */}
          <Card
            className="h-full border-primary/20 hover:border-primary transition-all cursor-pointer group relative overflow-hidden border-2 shadow-elevated hover:shadow-primary/20 bg-card/50 backdrop-blur-sm"
            onClick={onStartMultiplayer}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-3 right-3">
              <Badge className="bg-primary text-primary-foreground hover:bg-primary">
                Recomendado
              </Badge>
            </div>
            <CardHeader className="pb-2">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner mx-auto">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Responder em dupla
              </CardTitle>
              <CardDescription className="text-base">
                Descubra como vocês lidam com dinheiro.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full shadow-button group-hover:shadow-button-hover transition-all font-bold h-12 text-lg">
                Convidar Parceiro(a)
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground"
        >
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold overflow-hidden relative"
              >
                <Image
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`}
                  alt="User"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-medium text-foreground ml-1">4.9/5</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Archetypes Teaser */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-24"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Os 4 Arquétipos do Dinheiro
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Todo mundo tem um padrão dominante. Qual é o seu?
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(Object.keys(ARCHETYPES) as Archetype[]).map((type) => {
            const data = ARCHETYPES[type];
            return (
              <Card
                key={type}
                className="border-none shadow-sm bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <CardHeader>
                  <div
                    className={`w-10 h-10 rounded-full ${data.color} mb-4`}
                  />
                  <CardTitle className="text-xl">{data.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground italic mb-4">
                    "{data.motto}"
                  </p>
                  <p className="text-sm">{data.subtitle}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* Value Prop Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
        <div className="bg-card p-8 rounded-3xl border border-border/50 shadow-sm text-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Brain className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-3">Autoconhecimento</h3>
          <p className="text-muted-foreground">
            Entenda seus gatilhos de gastos e saia do piloto automático.
          </p>
        </div>
        <div className="bg-card p-8 rounded-3xl border border-border/50 shadow-sm text-center">
          <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-3">Sintonia no Amor</h3>
          <p className="text-muted-foreground">
            Dinheiro é a causa #1 de tretas. Alinhe os ponteiros sem perder o
            romance.
          </p>
        </div>
        <div className="bg-card p-8 rounded-3xl border border-border/50 shadow-sm text-center">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-3">Crescimento Real</h3>
          <p className="text-muted-foreground">
            Use seus pontos fortes para construir a vida que vocês merecem.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">
          Perguntas Frequentes
        </h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>O teste é realmente gratuito?</AccordionTrigger>
            <AccordionContent>
              Sim! O teste é 100% gratuito. Você recebe seu resultado completo e
              insights personalizados sem pagar nada.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>
              Preciso colocar dados bancários?
            </AccordionTrigger>
            <AccordionContent>
              Não. O teste é comportamental. Não pedimos nenhuma informação
              sensível ou conexão bancária para realizar o quiz.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Como funciona o modo casal?</AccordionTrigger>
            <AccordionContent>
              Você cria uma sala e envia o link para seu parceiro(a). Ambos
              respondem as perguntas individualmente. No final, o Lemon cruza os
              dados e gera um relatório de compatibilidade único.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
