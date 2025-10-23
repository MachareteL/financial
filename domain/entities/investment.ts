// domain/entities/investment.ts
import { z } from 'zod';

export const InvestmentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  type: z.enum(['savings','stocks','bonds','real_estate','crypto','other']),
  initialAmount: z.number().nonnegative(),
  currentAmount: z.number().nonnegative(),
  monthlyContribution: z.number().nonnegative(),
  annualReturnRate: z.number().nonnegative(),
  startDate: z.date(),
  familyId: z.string().uuid(),
  createdAt: z.date(),
});

export type InvestmentProps = z.infer<typeof InvestmentSchema>;

export class Investment {
  private props: InvestmentProps;

  constructor(props: InvestmentProps) {
    InvestmentSchema.parse(props);
    this.props = props;
  }

  get currentAmount(): number { return this.props.currentAmount }

  addContribution(amount: number) {
    if(amount <= 0) throw new Error("Valor inválido");
    this.props.currentAmount += amount;
  }
}
