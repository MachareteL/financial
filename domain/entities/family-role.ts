// domain/entities/family-role.ts
import { z } from 'zod';

export const FamilyRoleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  color: z.string().min(4), // #hex
  permissions: z.array(z.string()),
  familyId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type FamilyRoleProps = z.infer<typeof FamilyRoleSchema>;

export class FamilyRole {
  private props: FamilyRoleProps;

  constructor(props: FamilyRoleProps) {
    FamilyRoleSchema.parse(props);
    this.props = props;
  }

  get id(): string { return this.props.id }
  get name(): string { return this.props.name }
  get permissions(): string[] { return this.props.permissions }
}
