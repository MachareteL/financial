import { z } from "zod";

export const ReceiptSchema = z.object({
  amount: z.number({ required_error: "O valor total é obrigatório" }),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "A data deve estar no formato YYYY-MM-DD"),
  description: z.string().default("Despesa sem descrição"),
  category: z.string().optional(),
});

export type ReceiptDataDTO = z.infer<typeof ReceiptSchema>;
