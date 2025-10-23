import { z } from 'zod';

export const BudgetSchema = z.object({
  id: z.string().uuid(),
  month: z.number().min(1).max(12),
  year: z.number(),
  necessidadesBudget: z.number().nonnegative(),
  desejosBudget: z.number().nonnegative(),
  poupancaBudget: z.number().nonnegative(),
  totalIncome: z.number().nonnegative(),
  familyId: z.string().uuid(),
  createdAt: z.date(),
});

export type BudgetProps = z.infer<typeof BudgetSchema>;

export class Budget {
  private props: BudgetProps;

  constructor(props: BudgetProps) {
    BudgetSchema.parse(props);
    this.props = props;
  }

  get id(): string { return this.props.id }
  get month(): number { return this.props.month }
  get year(): number { return this.props.year }

  get totalBudget(): number {
    return this.props.necessidadesBudget + this.props.desejosBudget + this.props.poupancaBudget;
  }
}
