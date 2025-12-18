import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { SendFeedbackUseCase } from "./send-feedback.use-case";
import { IEmailService } from "@/domain/interfaces/email-service.interface";
import { IFeedbackRepository } from "@/domain/interfaces/feedback.repository.interface";
import { FeedbackDTO } from "@/domain/dto/feedback.dto";

describe("SendFeedbackUseCase", () => {
  let useCase: SendFeedbackUseCase;
  let emailService: IEmailService;
  let feedbackRepository: IFeedbackRepository;

  beforeEach(() => {
    emailService = {
      sendEmail: vi.fn(),
    } as unknown as IEmailService;

    feedbackRepository = {
      create: vi.fn(),
    } as unknown as IFeedbackRepository;

    useCase = new SendFeedbackUseCase(emailService, feedbackRepository);
  });

  const validDTO: FeedbackDTO = {
    type: "suggestion",
    title: "Dark Mode",
    description: "Please add dark mode.",
    email: "user@example.com",
    userId: "123e4567-e89b-12d3-a456-426614174000",
  };

  it("should send feedback successfully", async () => {
    await useCase.execute(validDTO);

    expect(feedbackRepository.create).toHaveBeenCalled();
    const createdFeedback = (feedbackRepository.create as Mock).mock
      .calls[0][0];
    expect(createdFeedback.title).toBe(validDTO.title);

    expect(emailService.sendEmail).toHaveBeenCalledWith(
      expect.arrayContaining(["suporte@lemonfinancas.com.br"]),
      expect.stringContaining("[Sugestão] Dark Mode"),
      expect.stringContaining(validDTO.description),
      expect.stringContaining("suggestion@lemonfinancas.com.br"),
      validDTO.email
    );
  });
});
