import { z } from 'zod';

export const FamilySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  createdAt: z.date(),
});

export type FamilyProps = z.infer<typeof FamilySchema>;

export class Family {
  private props: FamilyProps;

  constructor(props: FamilyProps) {
    FamilySchema.parse(props);
    this.props = props;
  }

  get id(): string { return this.props.id }
  get name(): string { return this.props.name }
  get createdAt(): Date { return this.props.createdAt }

  rename(newName: string) {
    if (newName.length < 2) throw new Error("Nome inválido");
    this.props.name = newName;
  }
}
