import { z } from "zod";

export const TeamInviteStatusSchema = z.enum([
  "pending",
  "accepted",
  "declined",
]);
export type TeamInviteStatus = z.infer<typeof TeamInviteStatusSchema>;

export const TeamInviteSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  status: TeamInviteStatusSchema.default("pending"),

  teamId: z.string().uuid(),
  roleId: z.string().uuid().nullable(),
  invitedBy: z.string().uuid(),

  createdAt: z.date(),
});

export type TeamInviteProps = z.infer<typeof TeamInviteSchema>;

export class TeamInvite {
  private props: TeamInviteProps;

  constructor(props: TeamInviteProps) {
    TeamInviteSchema.parse(props);
    this.props = { ...props, email: props.email.toLowerCase() };
  }

  get id(): string {
    return this.props.id;
  }
  get email(): string {
    return this.props.email;
  }
  get status(): TeamInviteStatus {
    return this.props.status;
  }
  get teamId(): string {
    return this.props.teamId;
  }
  get roleId(): string | null {
    return this.props.roleId;
  }
  get invitedBy(): string {
    return this.props.invitedBy;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }

  public accept(): void {
    if (this.props.status !== "pending") {
      throw new Error("Este convite não pode mais ser aceito.");
    }
    this.props.status = "accepted";
  }

  public decline(): void {
    if (this.props.status !== "pending") {
      throw new Error("Este convite não pode mais ser respondido.");
    }
    this.props.status = "declined";
  }
}
