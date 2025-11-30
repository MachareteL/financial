import { describe, it, expect, vi, beforeEach } from "vitest";
import { ParseReceiptUseCase } from "./parse-receipt.use-case";
import { IAiService } from "@/domain/interfaces/ai-service.interface";
import type { ReceiptDataDTO } from "@/domain/dto/ai.types";

describe("ParseReceiptUseCase", () => {
  let useCase: ParseReceiptUseCase;
  let aiService: IAiService;

  beforeEach(() => {
    aiService = {
      parseReceipt: vi.fn().mockResolvedValue({
        amount: 50.0,
        date: "2023-10-27",
        description: "Supermarket",
      }),
    } as unknown as IAiService;

    useCase = new ParseReceiptUseCase(aiService);
  });

  it("should parse a valid receipt successfully", async () => {
    const file = new File(["dummy content"], "receipt.jpg", {
      type: "image/jpeg",
    });

    // Mock arrayBuffer since jsdom File might not implement it fully or we want to control it
    file.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(10));

    const result = await useCase.execute(file);

    expect(result).toEqual({
      amount: 50.0,
      date: "2023-10-27",
      description: "Supermarket",
    });
    expect(aiService.parseReceipt).toHaveBeenCalled();
  });

  it("should throw error if file size exceeds 8MB", async () => {
    const largeFile = {
      size: 9 * 1024 * 1024, // 9MB
      type: "image/jpeg",
    } as File;

    await expect(useCase.execute(largeFile)).rejects.toThrow(
      "Este arquivo excede o limite de 8MB."
    );
    expect(aiService.parseReceipt).not.toHaveBeenCalled();
  });

  it("should throw error if file type is invalid", async () => {
    const invalidFile = {
      size: 1024,
      type: "text/plain",
    } as File;

    await expect(useCase.execute(invalidFile)).rejects.toThrow(
      "Formato de arquivo não suportado."
    );
    expect(aiService.parseReceipt).not.toHaveBeenCalled();
  });
});
