// domain/entities/income.ts
import { z } from 'zod';

export const IncomeSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().nonnegative(),
  description: z.string().optional(),
  type: z.enum(['recurring','one_time']),
  frequency: z.enum(['monthly','weekly','yearly']).nullable(),
  date: z.date(),
  familyId: z.string().uuid(),
  userId: z.string().uuid(),
  createdAt: z.date(),
});

export type IncomeProps = z.infer<typeof IncomeSchema>;

export class Income {
  private props: IncomeProps;

  constructor(props: IncomeProps) {
    IncomeSchema.parse(props);
    this.props = props;
  }

  get amount(): number { return this.props.amount }
}
