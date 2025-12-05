"use server";

import { z } from "zod";
import {
  sendFeedbackUseCase,
  getCurrentAuthUserUseCase,
} from "@/infrastructure/dependency-injection";
import { FeedbackDTO } from "@/domain/dto/feedback.dto";

const formSchema = z.object({
  type: z.enum(["bug", "suggestion", "complaint", "other"]),
  title: z.string().min(5, "O título deve ter pelo menos 5 caracteres"),
  description: z
    .string()
    .min(20, "A descrição deve ter pelo menos 20 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
});

export type FeedbackFormValues = z.infer<typeof formSchema>;

export async function sendFeedback(data: FeedbackFormValues) {
  const result = formSchema.safeParse(data);

  if (!result.success) {
    return { error: "Dados inválidos" };
  }

  // Get current user for tracking
  const session = await getCurrentAuthUserUseCase.execute();

  // Map to DTO
  const dto: FeedbackDTO = {
    type: result.data.type,
    title: result.data.title,
    description: result.data.description,
    email: result.data.email || undefined,
    userId: session?.user?.id,
  };

  try {
    await sendFeedbackUseCase.execute(dto);
    return { success: true };
  } catch (err) {
    console.error("Unexpected error sending email:", err);
    return { error: "Erro interno ao enviar feedback." };
  }
}
