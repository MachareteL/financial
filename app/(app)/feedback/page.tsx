import { FeedbackForm } from "./_components/feedback-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Central de Ajuda | Lemon",
  description: "Reporte bugs, envie sugestões ou reclamações.",
};

export default function FeedbackPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Central de Ajuda
          </h1>
          <p className="text-muted-foreground mt-2">
            Estamos aqui para ouvir você. Utilize o formulário abaixo para nos
            ajudar a melhorar o Lemon.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enviar Feedback</CardTitle>
            <CardDescription>
              Seus comentários são essenciais para construirmos a melhor
              experiência financeira juntos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FeedbackForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
