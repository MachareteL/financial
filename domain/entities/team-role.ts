import { z } from 'zod';

export const TeamRoleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  color: z.string().min(4), // #hex
  permissions: z.array(z.string()),
  teamId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});


export type TeamRoleProps = z.infer<typeof TeamRoleSchema>;


export class TeamRole {
  private props: TeamRoleProps;

  constructor(props: TeamRoleProps) {

    TeamRoleSchema.parse(props);
    this.props = props;
  }

  get id(): string { return this.props.id }
  get name(): string { return this.props.name }
  get permissions(): string[] { return this.props.permissions }
  get teamId(): string { return this.props.teamId }
  get color(): string { return this.props.color }
}