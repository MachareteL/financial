import { z } from "zod";

export const FeedbackSchema = z.object({
  id: z.string().uuid().optional(), // Optional as it's generated on DB often, or can be required if always created in code
  type: z.enum(["bug", "suggestion", "complaint", "other"]),
  title: z.string().min(5, "O título deve ter pelo menos 5 caracteres"),
  description: z
    .string()
    .min(20, "A descrição deve ter pelo menos 20 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  userId: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  status: z.enum(["pending", "resolved", "rejected"]).default("pending"),
});

export type FeedbackProps = z.infer<typeof FeedbackSchema>;

export class Feedback {
  public readonly props: FeedbackProps;

  constructor(props: FeedbackProps) {
    this.props = FeedbackSchema.parse(props);
  }

  get id(): string | undefined {
    return this.props.id;
  }
  get type() {
    return this.props.type;
  }
  get title() {
    return this.props.title;
  }
  get description() {
    return this.props.description;
  }
  get email() {
    return this.props.email;
  }
  get userId() {
    return this.props.userId;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get status() {
    return this.props.status;
  }
}
