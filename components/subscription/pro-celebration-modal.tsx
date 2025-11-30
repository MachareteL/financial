"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Trophy, Sparkles } from "lucide-react";
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
    const duration = 1.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 35 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#84cc16", "#facc15", "#ffffff"], // Lime, Yellow, White
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#84cc16", "#facc15", "#ffffff"],
      });
    }, 250);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Remove o parâmetro 'success' da URL sem recarregar a página
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("success");
    router.replace(`?${newParams.toString()}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent className="sm:max-w-md border-none bg-transparent shadow-none p-0 overflow-hidden">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 15, stiffness: 300 }}
              className="relative bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Background Decorativo */}
              <div className="absolute inset-0 bg-gradient-to-br from-lime-50 to-yellow-50 opacity-50" />

              {/* Círculos decorativos */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-lime-200 rounded-full blur-3xl opacity-30" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-yellow-200 rounded-full blur-3xl opacity-30" />

              <div className="relative p-8 flex flex-col items-center text-center">
                {/* Ícone Animado */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    damping: 10,
                    stiffness: 200,
                    delay: 0.2,
                  }}
                  className="w-24 h-24 bg-gradient-to-br from-lime-400 to-lime-600 rounded-full flex items-center justify-center shadow-lg shadow-lime-200 mb-6 relative group"
                >
                  <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-pulse" />
                  <Trophy className="w-12 h-12 text-white drop-shadow-md" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute -top-1 -right-1"
                  >
                    <Sparkles className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                  </motion.div>
                </motion.div>

                <DialogHeader className="mb-2">
                  <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                    Bem-vindo ao Lemon PRO! 🍋
                  </DialogTitle>
                </DialogHeader>

                <p className="text-slate-600 mb-8 leading-relaxed">
                  Sua IA agora é{" "}
                  <span className="font-bold text-lime-600">ilimitada</span>.
                  <br />
                  Chega de digitar notinhas manualmente.
                </p>

                <div className="w-full space-y-3">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handleClose}
                      className="w-full h-12 text-base font-bold bg-lime-500 hover:bg-lime-600 text-white shadow-lg shadow-lime-200 rounded-xl transition-all"
                    >
                      Começar a usar
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
