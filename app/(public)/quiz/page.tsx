"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { LoadingState } from "@/components/lemon/loading-state";
import { useSearchParams } from "next/navigation";
import {
  REAL_QUESTIONS,
  QuizOption,
} from "@/domain/entities/quiz/real-questions";
import {
  CalculateLifestyleUseCase,
  QuizResult,
} from "./_use-case/calculate-lifestyle.use-case";
import { GetCoupleInsightUseCase } from "./_use-case/get-couple-insight.use-case";
import { QuestionCard } from "./components/question-card";
import { ResultSection } from "./components/result-section";
import { WelcomeScreen } from "./components/welcome-screen";
import { MultiplayerManager } from "./components/multiplayer-manager";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

function QuizContent() {
  const searchParams = useSearchParams();
  const sessionParam = searchParams.get("session");

  const [view, setView] = useState<"welcome" | "quiz" | "result">("welcome");
  const [mode, setMode] = useState<"solo" | "multiplayer">("solo");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizOption[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);

  // Multiplayer State
  const [opponentAnswers, setOpponentAnswers] = useState<QuizOption[]>([]);
  const [coupleResult, setCoupleResult] = useState<{
    title: string;
    description: string;
    extendedDescription: string;
    tips: string[];
    compatibilityScore: number;
  } | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  // Refs
  const isAdvancing = useRef(false);

  // Auto-join if session param exists
  useEffect(() => {
    if (sessionParam) {
      setMode("multiplayer");
      // We stay in 'welcome' view but show the MultiplayerManager overlay
      // Actually, if we are joining, we might want to show the lobby immediately
      // But the current logic hides MultiplayerManager if view !== 'welcome' (except for background logic)
      // Let's keep view as 'welcome' so the manager is visible
    }
  }, [sessionParam]);

  const currentQuestion = REAL_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === REAL_QUESTIONS.length - 1;

  // Reset lock when question changes
  useEffect(() => {
    isAdvancing.current = false;
  }, [currentQuestionIndex]);

  const finishQuiz = (
    myFinalAnswers: QuizOption[],
    opponentFinalAnswers?: QuizOption[]
  ) => {
    const useCase = new CalculateLifestyleUseCase();
    const myResult = useCase.execute(myFinalAnswers);
    setResult(myResult);

    if (opponentFinalAnswers) {
      const opponentResult = useCase.execute(opponentFinalAnswers);
      const coupleUseCase = new GetCoupleInsightUseCase();
      const coupleInsight = coupleUseCase.execute(
        myResult.archetype,
        opponentResult.archetype
      );
      setCoupleResult(coupleInsight);
    }

    setView("result");
  };

  const handleStartSolo = () => {
    setMode("solo");
    setView("quiz");
  };

  const handleStartMultiplayer = () => {
    setMode("multiplayer");
    setIsCreatingSession(true);
  };

  const handleGameStart = () => {
    setView("quiz");
  };

  const handleSelectOption = (option: QuizOption) => {
    const newAnswers = [...answers, option];
    setAnswers(newAnswers);

    // In solo mode, advance immediately
    if (mode === "solo") {
      if (isLastQuestion) {
        finishQuiz(newAnswers);
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    }
    // In multiplayer, wait for effect to advance
  };

  // Effect to handle multiplayer progression
  useEffect(() => {
    if (mode !== "multiplayer") return;

    const myAnswer = answers[currentQuestionIndex];
    const opponentAnswer = opponentAnswers[currentQuestionIndex];

    if (myAnswer && opponentAnswer && !isAdvancing.current) {
      isAdvancing.current = true; // Lock immediately

      if (isLastQuestion) {
        finishQuiz(answers, opponentAnswers);
      } else {
        // Add a small delay for better UX
        setTimeout(() => {
          setCurrentQuestionIndex((prev) => prev + 1);
        }, 500);
      }
    }
  }, [answers, opponentAnswers, currentQuestionIndex, mode, isLastQuestion]);

  const handleRetake = () => {
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setResult(null);
    setView("welcome");
    setMode("solo");
    setOpponentAnswers([]);
    setCoupleResult(null);
    setIsCreatingSession(false);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center w-full max-w-5xl mx-auto">
      {/* Persistent Multiplayer Manager */}
      {mode === "multiplayer" && (
        <div className={view === "welcome" ? "w-full max-w-md" : "hidden"}>
          {view === "welcome" && !sessionParam && (
            <Button
              variant="ghost"
              onClick={() => {
                setMode("solo");
                setIsCreatingSession(false);
              }}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
          )}
          <MultiplayerManager
            onOpponentUpdate={setOpponentAnswers}
            onGameStart={handleGameStart}
            currentAnswers={answers}
            autoCreate={isCreatingSession}
            joinSessionId={sessionParam}
          />
        </div>
      )}

      {view === "welcome" && mode === "solo" && (
        <WelcomeScreen
          onStartSolo={handleStartSolo}
          onStartMultiplayer={handleStartMultiplayer}
        />
      )}

      {view === "quiz" && (
        <div className="w-full max-w-4xl">
          <QuestionCard
            question={currentQuestion}
            onSelectOption={handleSelectOption}
            currentStep={currentQuestionIndex + 1}
            totalSteps={REAL_QUESTIONS.length}
          />
          {mode === "multiplayer" &&
            answers[currentQuestionIndex] &&
            !opponentAnswers[currentQuestionIndex] && (
              <div className="mt-4 text-center animate-pulse text-muted-foreground">
                Aguardando seu parceiro responder...
              </div>
            )}
        </div>
      )}

      {view === "result" && result && (
        <div className="w-full max-w-4xl">
          <ResultSection
            result={result}
            coupleResult={coupleResult}
            onRetake={handleRetake}
          />
        </div>
      )}
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<LoadingState message="Carregando quiz..." />}>
      <QuizContent />
    </Suspense>
  );
}
