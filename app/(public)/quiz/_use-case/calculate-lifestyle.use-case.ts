import { Archetype, QuizOption } from "@/domain/entities/quiz/real-questions";

export interface QuizResult {
  archetype: Archetype;
  axes: {
    discipline: number;
    security: number;
    horizon: number;
  };
}

export class CalculateLifestyleUseCase {
  execute(answers: QuizOption[]): QuizResult {
    const scores: Record<Archetype, number> = {
      Strategist: 0,
      Experiencer: 0,
      Builder: 0,
      Minimalist: 0,
    };

    answers.forEach((answer) => {
      scores[answer.archetype]++;
    });

    // Find the archetype with the highest score
    let dominantArchetype: Archetype = "Strategist";
    let maxScore = -1;

    (Object.keys(scores) as Archetype[]).forEach((archetype) => {
      if (scores[archetype] > maxScore) {
        maxScore = scores[archetype];
        dominantArchetype = archetype;
      }
    });

    return {
      archetype: dominantArchetype,
      axes: {
        discipline: this.calculateAxis(scores.Experiencer, scores.Strategist), // Vivência vs Controle
        security: this.calculateAxis(scores.Minimalist, scores.Builder), // Conservador vs Arrojado
        horizon: this.calculateAxis(
          // Presente vs Futuro
          scores.Experiencer + scores.Minimalist,
          scores.Strategist + scores.Builder
        ),
      },
    };
  }

  private calculateAxis(leftScore: number, rightScore: number): number {
    const total = leftScore + rightScore;
    if (total === 0) return 50; // Balanced
    // Return percentage for the Right side (0 = Full Left, 100 = Full Right)
    return Math.round((rightScore / total) * 100);
  }
}
