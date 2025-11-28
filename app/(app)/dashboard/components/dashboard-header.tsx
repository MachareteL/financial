import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, LogOut } from "lucide-react";

interface DashboardHeaderProps {
  userName: string;
  teamName: string;
  selectedMonth: number;
  setSelectedMonth: (m: number) => void;
  selectedYear: number;
  setSelectedYear: (y: number) => void;
  isLoading: boolean;
  onLogout: () => void;
}

const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function DashboardHeader({
  userName,
  teamName,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  isLoading,
  onLogout,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          Olá, {userName}! <span className="text-2xl">👋</span>
        </h1>
        <p className="text-slate-500 text-sm">
          Visão geral de <strong>{teamName}</strong>
        </p>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Select
          value={selectedMonth.toString()}
          onValueChange={(v) => setSelectedMonth(Number(v))}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[140px] bg-white border-slate-200 shadow-sm">
            <CalendarDays className="w-4 h-4 mr-2 text-blue-500" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((m, i) => (
              <SelectItem key={i} value={(i + 1).toString()}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedYear.toString()}
          onValueChange={(v) => setSelectedYear(Number(v))}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[100px] bg-white border-slate-200 shadow-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[2023, 2024, 2025, 2026].map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          size="icon"
          variant="ghost"
          onClick={onLogout}
          className="ml-auto sm:ml-0 text-slate-400 hover:text-red-500 hover:bg-red-50"
          title="Sair"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
