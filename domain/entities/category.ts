import { z } from 'zod';

export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  classification: z.enum(['necessidades', 'desejos', 'poupanca']),
  familyId: z.string().uuid(),
  createdAt: z.date(),
});

export type CategoryProps = z.infer<typeof CategorySchema>;

export class Category {
  private props: CategoryProps;

  constructor(props: CategoryProps) {
    CategorySchema.parse(props);
    this.props = props;
  }

  get id(): string { return this.props.id }
  get name(): string { return this.props.name }
  get classification(): 'necessidades' | 'desejos' | 'poupanca' { return this.props.classification }
}
