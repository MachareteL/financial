import {
  QuizOption,
  QuizQuestion,
} from "@/domain/entities/quiz/real-questions";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface QuestionCardProps {
  question: QuizQuestion;
  onSelectOption: (option: QuizOption) => void;
  currentStep: number;
  totalSteps: number;
}

export function QuestionCard({
  question,
  onSelectOption,
  currentStep,
  totalSteps,
}: QuestionCardProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8 relative h-2 w-full bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-8 text-center">
            <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
              PERGUNTA {currentStep} DE {totalSteps}
            </span>
            <h2 className="mt-6 text-3xl md:text-4xl font-bold text-foreground leading-tight tracking-tight">
              {question.text}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {question.options.map((option, index) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onSelectOption(option)}
                className={cn(
                  "group relative p-6 text-left border-2 border-border rounded-2xl transition-all duration-200",
                  "hover:border-primary hover:bg-primary/5 hover:shadow-lg hover:-translate-y-1",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  "bg-card text-card-foreground active:scale-[0.98]"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium group-hover:text-primary transition-colors">
                    {option.text}
                  </span>
                  <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 group-hover:border-primary group-hover:bg-primary transition-all" />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
