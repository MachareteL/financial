import { IEmailService } from "@/domain/interfaces/email-service.interface";
import { Resend } from "resend";

export class ResendEmailService implements IEmailService {
  private resend: Resend | null = null;

  constructor(apiKey: string) {
    if (!apiKey) {
      console.warn(
        "Resend API Key is missing. Email sending will likely fail."
      );
      return;
    }
    this.resend = new Resend(apiKey);
  }

  async sendEmail(
    to: string[],
    subject: string,
    html: string,
    from?: string,
    replyTo?: string
  ): Promise<void> {
    if (!this.resend) {
      console.error("Resend API Key is missing. Cannot send email.");
      throw new Error(
        "Failed to send email: Resend service is not properly initialized (missing API Key)."
      );
    }

    const fromAddress = from || "onboarding@resend.dev";

    const { error } = await this.resend.emails.send({
      from: fromAddress,
      to,
      subject,
      html,
      replyTo,
    });

    if (error) {
      console.error("Resend Error:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}
