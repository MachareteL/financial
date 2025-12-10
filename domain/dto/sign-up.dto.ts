import { z } from "zod";

export const SignUpInputSchema = z.object({
  name: z.string().min(2, {
    message: "Seu nome precisa ser um pouquinho maior (mínimo 2 letras).",
  }),
  email: z.string().email({
    message: "Esse formato de email parece estranho. Pode conferir?",
  }),
  password: z.string().min(6, {
    message: "Sua senha precisa ter pelo menos 6 caracteres para ser segura.",
  }),
});

export type SignUpInputDTO = z.infer<typeof SignUpInputSchema>;
