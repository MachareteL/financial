import { IEmailService } from "@/domain/interfaces/email-service.interface";
import { Resend } from "resend";

export class ResendEmailService implements IEmailService {
  private resend: Resend | null = null;
  private isConfigured: boolean = false;

  constructor(apiKey?: string) {
    if (typeof window !== "undefined") {
      throw new Error(
        "ResendEmailService can only be initialized on the server"
      );
    }

    if (!apiKey) {
      console.warn(
        "Resend API Key is missing. Email features will be disabled."
      );
      this.isConfigured = false;
      return;
    }

    this.resend = new Resend(apiKey);
    this.isConfigured = true;
  }

  async sendEmail(
    to: string[],
    subject: string,
    html: string,
    from?: string,
    replyTo?: string
  ): Promise<void> {
    if (!this.isConfigured || !this.resend) {
      throw new Error(
        "Email service is not configured. Please set RESEND_API_KEY environment variable."
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
