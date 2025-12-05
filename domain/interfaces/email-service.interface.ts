export interface IEmailService {
  sendEmail(
    to: string[],
    subject: string,
    html: string,
    from?: string,
    replyTo?: string
  ): Promise<void>;
}
