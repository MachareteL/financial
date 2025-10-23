import { z } from 'zod';
import { Family } from './family';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2),
  familyId: z.string().uuid().nullable(),
  createdAt: z.date(),
});

export type UserProps = z.infer<typeof UserSchema>;

export class User {
  private props: UserProps;
  private _family?: Family | null;

  constructor(props: UserProps, family?: Family | null) {
    UserSchema.parse(props);
    this.props = { ...props, email: props.email.toLowerCase() };
    this._family = family ?? null;
  }

  get id(): string { return this.props.id }
  get email(): string { return this.props.email }
  get name(): string { return this.props.name }
  get familyId(): string | null { return this.props.familyId }
  get family(): Family | null { return this._family ?? null }

  isMemberOfFamily(familyId: string): boolean {
    return this.props.familyId === familyId;
  }

  joinFamily(family: Family) {
    this._family = family;
    this.props.familyId = family.id;
  }
}
