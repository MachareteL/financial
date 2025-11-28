import { Home, ShoppingBag, PiggyBank, Wallet } from "lucide-react";

// --- CONFIGURAÇÃO DE CORES E ÍCONES ---
export const FOLDER_ICONS: Record<string, any> = {
  Necessidades: Home,
  Desejos: ShoppingBag,
  Poupança: PiggyBank,
  Investimentos: PiggyBank,
  Outros: Wallet,
};

// Estilos modernos para Badges e Ícones
export const FOLDER_STYLES: Record<
  string,
  { bg: string; text: string; border: string; badge: string }
> = {
  Necessidades: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-100",
    badge: "bg-blue-100/50 text-blue-700 hover:bg-blue-200 border-blue-200",
  },
  Desejos: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-100",
    badge:
      "bg-purple-100/50 text-purple-700 hover:bg-purple-200 border-purple-200",
  },
  Poupança: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-100",
    badge:
      "bg-emerald-100/50 text-emerald-700 hover:bg-emerald-200 border-emerald-200",
  },
  Investimentos: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-100",
    badge:
      "bg-emerald-100/50 text-emerald-700 hover:bg-emerald-200 border-emerald-200",
  },
  Outros: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-100",
    badge: "bg-slate-100/50 text-slate-700 hover:bg-slate-200 border-slate-200",
  },
};

export const getCategoryStyle = (folderName: string | null) => {
  const name = folderName || "Outros";
  const key =
    Object.keys(FOLDER_ICONS).find((k) => name.includes(k)) || "Outros";
  return {
    icon: FOLDER_ICONS[key],
    theme: FOLDER_STYLES[key] || FOLDER_STYLES["Outros"],
  };
};
