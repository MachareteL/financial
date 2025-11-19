"use server";

import { parseReceiptUseCase } from "@/infrastructure/dependency-injection";
import type { ReceiptDataDTO } from "@/domain/entities/receipt";

export async function parseReceiptAction(formData: FormData): Promise<ReceiptDataDTO | null> {
  const file = formData.get("file") as File;

  if (!file || file.size === 0) return null;

  try {
    return await parseReceiptUseCase.execute(file);
  } catch (error) {
    console.error("Erro ao processar recibo:", error);
    return null; 
  }
}