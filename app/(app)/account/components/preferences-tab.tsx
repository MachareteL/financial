"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bot, Sparkles, Globe, Moon, Save, Loader2 } from "lucide-react";
import { notify } from "@/lib/notify-helper";

export function PreferencesTab() {
  const [isLoading, setIsLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState(true);
  const [aiTone, setAiTone] = useState("casual");
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState("pt-BR");

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock API call
    setTimeout(() => {
      setIsLoading(false);
      notify.success("Preferências salvas com sucesso!");
    }, 800);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* AI Preferences */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Inteligência Artificial
          </h3>
        </div>
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              Personalização da IA
            </CardTitle>
            <CardDescription>
              Ajuste como a IA interage com você e analisa seus dados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Insights Personalizados</Label>
                <p className="text-sm text-muted-foreground">
                  Permitir que a IA use seu histórico para sugerir economias.
                </p>
              </div>
              <Switch checked={aiInsights} onCheckedChange={setAiInsights} />
            </div>

            <div className="space-y-2">
              <Label>Tom de Voz da IA</Label>
              <Select value={aiTone} onValueChange={setAiTone}>
                <SelectTrigger className="bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual e Amigável</SelectItem>
                  <SelectItem value="formal">Formal e Direto</SelectItem>
                  <SelectItem value="concise">
                    Conciso (Apenas dados)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* General Preferences */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Geral</h3>
        <Card>
          <CardHeader>
            <CardTitle>Aparência e Idioma</CardTitle>
            <CardDescription>
              Personalize sua experiência no aplicativo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSavePreferences}
              className="space-y-6 max-w-md"
            >
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-muted-foreground" />
                  Tema
                </Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  Idioma
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2">
                <Button disabled={isLoading} type="submit">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Salvar Preferências
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
