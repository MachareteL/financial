"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Trophy, Sparkles, Zap, ScanLine, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ProCelebrationModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setIsOpen(true);
      triggerConfetti();
    }
  }, [searchParams]);

  const triggerConfetti = () => {
    const duration = 2 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 180,
      ticks: 100,
      zIndex: 100,
    };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 40 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#84cc16", "#10b981", "#ffffff"], // Lime, Emerald, White
        shapes: ["circle", "square"],
        scalar: 1.2,
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#84cc16", "#10b981", "#ffffff"],
        shapes: ["circle", "square"],
        scalar: 1.2,
      });
    }, 200);
  };

  const handleClose = () => {
    setIsOpen(false);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("success");
    router.replace(`?${newParams.toString()}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent className="sm:max-w-md border-none bg-transparent shadow-none p-0 overflow-hidden px-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
              }}
              className="relative bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Background Effects - Restored */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(132,204,22,0.15),transparent_70%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),transparent)]" />

              {/* Animated Glow Orbs */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-20 -right-20 w-64 h-64 bg-lime-500/20 rounded-full blur-[80px]"
              />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px]"
              />

              <div className="relative p-8 flex flex-col items-center text-center z-10">
                {/* Icon Container - Less Heavy Glow */}
                <div className="relative mb-6">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      damping: 15,
                      stiffness: 200,
                      delay: 0.1,
                    }}
                    className="w-20 h-20 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center shadow-xl relative"
                  >
                    <Trophy className="w-10 h-10 text-lime-400" />

                    {/* Subtle Orbit */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-[-8px] opacity-50"
                    >
                      <div className="w-2 h-2 bg-lime-500 rounded-full absolute top-0 left-1/2 -translate-x-1/2" />
                    </motion.div>
                  </motion.div>
                </div>

                <DialogHeader className="mb-6 space-y-2">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/20 text-lime-400 text-xs font-bold uppercase tracking-wider mb-2">
                      <Zap className="w-3 h-3 fill-lime-400" />
                      Upgrade Complete
                    </div>
                  </motion.div>

                  <DialogTitle className="text-2xl font-bold text-white tracking-tight">
                    Bem-vindo ao{" "}
                    <span className="text-lime-400">Lemon PRO</span>
                  </DialogTitle>
                </DialogHeader>

                {/* Feature List - Structured & Clear */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="w-full space-y-4 mb-8 text-left bg-white/5 rounded-xl p-4 border border-white/5"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-lime-500/10 text-lime-400 mt-0.5">
                      <ScanLine className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        Leitura ilimitada
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Digitalize quantas notas fiscais quiser com nossa IA.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        Insights Semanais
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Receba análises inteligentes sobre seus gastos.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="w-full"
                >
                  <Button
                    onClick={handleClose}
                    className="w-full h-12 text-sm font-bold bg-lime-500 hover:bg-lime-600 text-slate-950 rounded-xl transition-all"
                  >
                    Começar a usar
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
