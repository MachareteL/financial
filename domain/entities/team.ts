import { z } from "zod";

export const TeamSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  trialEndsAt: z.date().nullable().optional(),
});

export type TeamProps = z.infer<typeof TeamSchema>;

export class Team {
  private props: TeamProps;

  constructor(props: TeamProps) {
    TeamSchema.parse(props);
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }
  get name(): string {
    return this.props.name;
  }
  get createdBy(): string {
    return this.props.createdBy;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get trialEndsAt(): Date | null | undefined {
    return this.props.trialEndsAt;
  }

  rename(newName: string) {
    if (newName.length < 2) throw new Error("Nome inválido");
    this.props.name = newName;
  }

  isPro(hasActiveSubscription: boolean): boolean {
    const isTrialActive = this.props.trialEndsAt
      ? new Date() < this.props.trialEndsAt
      : false;
    return isTrialActive || hasActiveSubscription;
  }
}
