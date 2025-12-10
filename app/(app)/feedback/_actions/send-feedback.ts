"use server";

import { z } from "zod";
import {
  sendFeedbackUseCase,
  getCurrentAuthUserUseCase,
} from "@/infrastructure/dependency-injection";
import { FeedbackDTO } from "@/domain/dto/feedback.dto";

const formSchema = z.object({
  type: z.enum(["bug", "suggestion", "complaint", "other"]),
  title: z.string().min(5, "O título precisa ter pelo menos 5 letras."),
  description: z
    .string()
    .min(20, "A descrição precisa ser mais detalhada (mínimo 20 caracteres)"),
  email: z
    .string()
    .email("Esse email parece não estar certo")
    .optional()
    .or(z.literal("")),
});

export type FeedbackFormValues = z.infer<typeof formSchema>;

export async function sendFeedback(data: FeedbackFormValues) {
  const result = formSchema.safeParse(data);

  if (!result.success) {
    return { error: "Verifique se preencheu tudo certinho." };
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
    return {
      error:
        "Não conseguimos enviar seu feedback. Tente de novo em alguns instantes.",
    };
  }
}
