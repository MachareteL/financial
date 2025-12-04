import { useEffect, useState, useRef } from "react";
import { usePostHog } from "posthog-js/react";
import { getSupabaseClient } from "@/infrastructure/database/supabase.client";
import { QuizOption } from "@/domain/entities/quiz/real-questions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, Copy, CheckCircle2 } from "lucide-react";

interface MultiplayerManagerProps {
  onOpponentUpdate: (answers: QuizOption[]) => void;
  onGameStart: () => void;
  currentAnswers: QuizOption[];
  autoCreate?: boolean;
  joinSessionId?: string | null;
}

export function MultiplayerManager({
  onOpponentUpdate,
  onGameStart,
  currentAnswers,
  autoCreate = false,
  joinSessionId = null,
}: MultiplayerManagerProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "creating" | "joining" | "waiting" | "ready" | "playing"
  >("idle");
  const statusRef = useRef(status);
  const initialized = useRef(false);
  const posthog = usePostHog();

  const supabase = getSupabaseClient();

  // Keep ref in sync
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Auto-init logic
  useEffect(() => {
    if (initialized.current) return;

    if (joinSessionId) {
      initialized.current = true;
      joinSession(joinSessionId);
    } else if (autoCreate) {
      initialized.current = true;
      createSession();
    }
  }, [autoCreate, joinSessionId]);

  // Create Session
  const createSession = async () => {
    if (!supabase) return;
    setStatus("creating");

    const { data, error } = await supabase
      .from("quiz_sessions")
      .insert([{ status: "waiting" }])
      .select()
      .single();

    if (data && !error) {
      setSessionId(data.id);
      setIsHost(true);
      setStatus("waiting");
      subscribeToSession(data.id, true);
      posthog?.capture("multiplayer_session_created", { session_id: data.id });
    }
  };

  // Join Session
  const joinSession = async (id: string) => {
    if (!supabase) return;
    setStatus("joining");

    const { data, error } = await supabase
      .from("quiz_sessions")
      .select()
      .eq("id", id)
      .single();

    if (data && !error) {
      setSessionId(data.id);
      setIsHost(false);
      setStatus("ready"); // Guest is ready immediately upon joining

      // Subscribe FIRST to ensure we don't miss events
      subscribeToSession(data.id, false);

      // Update status to playing
      const { error: updateError } = await supabase
        .from("quiz_sessions")
        .update({ status: "playing" })
        .eq("id", id);

      if (!updateError) {
        // Manually trigger start for Guest to avoid race condition with Realtime
        setStatus("playing");
        onGameStart();
      }
    } else {
      alert("Sessão não encontrada!");
      setStatus("idle");
      initialized.current = false; // Allow retry
    }
  };

  // Subscribe to Realtime
  const subscribeToSession = (id: string, isHostParam: boolean) => {
    if (!supabase) return;

    const channel = supabase
      .channel(`quiz_session:${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "quiz_sessions",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          const newData = payload.new;

          // Use ref to check current status to avoid stale closure
          if (newData.status === "playing" && statusRef.current !== "playing") {
            setStatus("playing");
            onGameStart();
          }

          // Sync answers
          console.log("Realtime Update:", { isHostParam, newData });
          if (isHostParam) {
            if (newData.answers_p2) {
              console.log(
                "Host updating opponent answers:",
                newData.answers_p2
              );
              onOpponentUpdate(newData.answers_p2 as QuizOption[]);
            }
          } else {
            if (newData.answers_p1) {
              console.log(
                "Guest updating opponent answers:",
                newData.answers_p1
              );
              onOpponentUpdate(newData.answers_p1 as QuizOption[]);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // Sync my answers
  useEffect(() => {
    if (!sessionId || !supabase) return;

    const updateAnswers = async () => {
      const field = isHost ? "answers_p1" : "answers_p2";
      console.log(`Sending answers to ${field}:`, currentAnswers);
      await supabase
        .from("quiz_sessions")
        .update({ [field]: currentAnswers })
        .eq("id", sessionId);
    };

    if (currentAnswers.length > 0) {
      updateAnswers();
    }
  }, [currentAnswers, sessionId, isHost, supabase]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/quiz?session=${sessionId}`;
    navigator.clipboard.writeText(url);
    alert("Link copiado!");
  };

  if (status === "idle") {
    // Should typically not happen with autoCreate/joinSessionId, but fallback just in case
    return (
      <div className="flex flex-col gap-4 w-full max-w-md mx-auto text-center">
        <p className="text-muted-foreground">Inicializando...</p>
      </div>
    );
  }

  if (status === "waiting") {
    return (
      <Card className="w-full max-w-md mx-auto text-center border-2 border-primary/20 shadow-elevated">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Loader2 className="animate-spin text-primary" /> Aguardando
            Parceiro(a)
          </CardTitle>
          <CardDescription className="text-base">
            Envie o link para começarem juntos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 bg-primary/5 rounded-xl border border-primary/10">
            <Button
              size="lg"
              className="w-full font-bold shadow-button mb-2"
              onClick={handleCopyLink}
            >
              <Copy className="mr-2 h-5 w-5" />
              Copiar Link de Convite
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Ou compartilhe o código:{" "}
              <span className="font-mono font-bold text-foreground">
                {sessionId}
              </span>
            </p>
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">
            O jogo começará automaticamente assim que entrarem.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (status === "joining" || status === "creating") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium text-muted-foreground">
          {status === "creating" ? "Criando sala..." : "Entrando na sala..."}
        </p>
      </div>
    );
  }

  if (status === "ready") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-6" />
        <h3 className="text-2xl font-bold mb-2">Tudo pronto!</h3>
        <p className="text-muted-foreground text-lg">
          Aguardando o anfitrião iniciar...
        </p>
      </div>
    );
  }

  return null; // Invisible when playing
}
