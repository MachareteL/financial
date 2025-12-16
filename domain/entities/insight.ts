import { z } from "zod";

export const InsightTypeSchema = z.enum([
  "WEEKLY_REPORT",
  "BUDGET_ALERT",
  "INVESTMENT_TIP",
]);

export type InsightType = z.infer<typeof InsightTypeSchema>;

export const InsightSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid(),
  type: InsightTypeSchema,
  title: z.string().min(1),
  content: z.string().min(1),
  isRead: z.boolean().default(false),
  createdAt: z.date(),
  actionUrl: z.string().nullish(),
});

export type InsightProps = z.infer<typeof InsightSchema>;

export class Insight {
  public readonly props: InsightProps;

  constructor(props: InsightProps) {
    this.props = InsightSchema.parse(props);
  }

  get id(): string {
    return this.props.id;
  }
  get teamId(): string {
    return this.props.teamId;
  }
  get type(): InsightType {
    return this.props.type;
  }
  get title(): string {
    return this.props.title;
  }
  get content(): string {
    return this.props.content;
  }
  get isRead(): boolean {
    return this.props.isRead;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get actionUrl(): string | null | undefined {
    return this.props.actionUrl;
  }

  public markAsRead(): Insight {
    return new Insight({
      ...this.props,
      isRead: true,
    });
  }
}
