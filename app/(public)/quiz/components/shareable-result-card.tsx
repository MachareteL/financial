import { Archetype, ARCHETYPES } from "@/domain/entities/quiz/real-questions";
import { QuizResult } from "../_use-case/calculate-lifestyle.use-case";
import { cn } from "@/lib/utils";

interface ShareableResultCardProps {
  result: QuizResult;
  archetypeData: any;
  themeColors: any;
}

// Lemon Brand Colors (Hardcoded to ensure consistency in generated image)
const COLORS = {
  primary: "#65a30d", // lime-600 (A bit darker for text readability)
  primaryLight: "#bef264", // lime-300
  background: "#ffffff",
  textMain: "#0f172a", // slate-900 equivalent
  textMuted: "#475569", // slate-600 equivalent
  border: "#e2e8f0", // slate-200
};

const ARCHETYPE_COLORS: Record<Archetype, string> = {
  Strategist: "#3b82f6", // blue-500
  Experiencer: "#f59e0b", // amber-500
  Builder: "#22c55e", // green-500
  Minimalist: "#64748b", // slate-500
};

export function ShareableResultCard({
  result,
  archetypeData,
}: ShareableResultCardProps) {
  const totalScore = Object.values(result.scores).reduce((a, b) => a + b, 0);

  const getPercentage = (score: number) => {
    return Math.round((score / totalScore) * 100);
  };

  return (
    <div
      id="shareable-result-card"
      className="w-[600px] h-[900px] relative overflow-hidden flex flex-col p-12 font-sans"
      style={{
        backgroundColor: COLORS.background,
        color: COLORS.textMain,
      }}
    >
      {/* Decorative Background - Subtle Lemon Gradient */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, #84cc16 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, #84cc16 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-16 z-10">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-sm"
            style={{ backgroundColor: COLORS.primary, color: "#ffffff" }}
          >
            🍋
          </div>
          <span
            className="font-black text-3xl tracking-tight"
            style={{ color: COLORS.textMain }}
          >
            Lemon
          </span>
        </div>
        <div
          className="px-4 py-2 rounded-full border shadow-sm"
          style={{ borderColor: COLORS.border, backgroundColor: "#ffffff" }}
        >
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: COLORS.textMuted }}
          >
            DNA Financeiro
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center z-10 text-center">
        {/* Archetype Icon/Badge */}
        <div className="relative mb-10">
          <div
            className="w-48 h-48 rounded-full flex items-center justify-center text-8xl shadow-2xl bg-white border-8 relative z-10"
            style={{ borderColor: "#f7fee7" }} // lime-50
          >
            🍋
          </div>
          <div
            className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg whitespace-nowrap z-20 uppercase tracking-wide"
            style={{ backgroundColor: COLORS.primary }}
          >
            Seu Arquétipo
          </div>
        </div>

        <h1
          className="text-6xl font-black tracking-tight mb-6 mt-4"
          style={{ color: COLORS.textMain }}
        >
          {archetypeData.title}
        </h1>

        <p
          className="text-2xl font-medium italic max-w-lg mx-auto leading-relaxed mb-16"
          style={{ color: COLORS.textMuted }}
        >
          &ldquo;{archetypeData.motto}&rdquo;
        </p>

        {/* Composition Chart */}
        <div
          className="w-full max-w-md p-8 rounded-3xl border shadow-xl bg-white/80 backdrop-blur-sm"
          style={{ borderColor: COLORS.border }}
        >
          <h3
            className="text-xs font-bold uppercase tracking-widest mb-6 text-left border-b pb-3"
            style={{ color: COLORS.textMuted, borderColor: COLORS.border }}
          >
            Sua Composição
          </h3>
          <div className="space-y-5">
            {(Object.entries(result.scores) as [Archetype, number][])
              .sort(([, a], [, b]) => b - a)
              .map(([type, score]) => {
                const percentage = getPercentage(score);
                if (percentage === 0) return null;

                const isDominant = type === result.archetype;

                return (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between text-sm items-end">
                      <span
                        className={cn("font-bold")}
                        style={{
                          color: isDominant
                            ? COLORS.textMain
                            : COLORS.textMuted,
                          fontSize: isDominant ? "1.1rem" : "0.9rem",
                        }}
                      >
                        {ARCHETYPES[type].title}
                      </span>
                      <span
                        className="font-mono font-medium"
                        style={{
                          color: isDominant ? COLORS.textMain : "#94a3b8",
                        }}
                      >
                        {percentage}%
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full overflow-hidden bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: ARCHETYPE_COLORS[type],
                          opacity: isDominant ? 1 : 0.5,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-12 z-10 text-center">
        <p className="text-sm font-medium" style={{ color: COLORS.textMuted }}>
          Descubra o seu perfil completo em{" "}
          <span className="font-bold" style={{ color: COLORS.primary }}>
            lemon.finance
          </span>
        </p>
      </div>
    </div>
  );
}
