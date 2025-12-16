import { FeedbackDTO } from "@/domain/dto/feedback.dto";
import { IEmailService } from "@/domain/interfaces/email-service.interface";
import { IFeedbackRepository } from "@/domain/interfaces/feedback.repository.interface";
import { Feedback } from "@/domain/entities/feedback";
import { FeedbackMapper } from "@/domain/mappers/feedback.mapper";

export class SendFeedbackUseCase {
  constructor(
    private emailService: IEmailService,
    private feedbackRepository: IFeedbackRepository
  ) {}

  async execute(dto: FeedbackDTO): Promise<void> {
    // Create Domain Entity
    // Create Domain Entity
    const feedback = FeedbackMapper.fromCreateDTO(dto);

    // 1. Save to Database
    await this.feedbackRepository.create(feedback);

    // 2. Send Email
    const { type, title, description, email } = feedback;

    // Business Logic: Determine labels and recipients
    const typeLabels = {
      bug: "Bug",
      suggestion: "Sugestão",
      complaint: "Reclamação",
      other: "Outros",
    };

    const label = typeLabels[type] || "Feedback";
    const senderPrefix = type.toLowerCase().replace(/[^a-z0-9]/g, "");

    // Configurable parts (could be injected config, but hardcoded for now as per prev impl)
    const fromAddress = `Lemon Feedback <${senderPrefix}@lemonfinancas.com.br>`;
    const toAddress = ["suporte@lemonfinancas.com.br"];
    const subject = `[${label}] ${title}`;

    const htmlContent = `
      <div style="font-family: sans-serif; color: #333;">
        <h1>Novo Feedback Recebido</h1>
        <p><strong>Tipo:</strong> ${label}</p>
        <p><strong>Título:</strong> ${title}</p>
        <hr />
        <h3>Descrição:</h3>
        <p style="white-space: pre-wrap;">${description}</p>
        <hr />
        <p><strong>Enviado por:</strong> ${email || "Anônimo"}</p>
      </div>
    `;

    await this.emailService.sendEmail(
      toAddress,
      subject,
      htmlContent,
      fromAddress,
      // If anonymous, replyTo is undefined (Resend ignores it or handles it)
      email || undefined
    );
  }
}
