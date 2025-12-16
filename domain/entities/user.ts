import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2),
  createdAt: z.date(),
});

export type UserProps = z.infer<typeof UserSchema>;

export class User {
  private props: UserProps;

  constructor(props: UserProps) {
    UserSchema.parse(props);
    this.props = { ...props, email: props.email.toLowerCase() };
  }

  get id(): string {
    return this.props.id;
  }
  get email(): string {
    return this.props.email;
  }
  get name(): string {
    return this.props.name;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
}
