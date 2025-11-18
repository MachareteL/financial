import { z } from 'zod';

export const InvestmentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, { message: "O nome é obrigatório" }),
  type: z.enum(['savings', 'stocks', 'bonds', 'real_estate', 'crypto', 'other']),
  initialAmount: z.number().nonnegative(),
  currentAmount: z.number().nonnegative(),
  monthlyContribution: z.number().nonnegative().default(0),
  annualReturnRate: z.number().nonnegative(), // porcentagem (ex: 10.5 para 10.5%)
  startDate: z.date(),
  teamId: z.string().uuid(),
  createdAt: z.date(),
});

export type InvestmentProps = z.infer<typeof InvestmentSchema>;

export type UpdateInvestmentProps = Partial<Pick<InvestmentProps, 
  'name' | 'type' | 'initialAmount' | 'currentAmount' | 'monthlyContribution' | 'annualReturnRate' | 'startDate'
>>;

export class Investment {
  public readonly props: InvestmentProps;

  constructor(props: InvestmentProps) {
    this.props = InvestmentSchema.parse(props);
  }

  get id(): string { return this.props.id }
  get name(): string { return this.props.name }
  get type() { return this.props.type }
  get initialAmount(): number { return this.props.initialAmount }
  get currentAmount(): number { return this.props.currentAmount }
  get monthlyContribution(): number { return this.props.monthlyContribution }
  get annualReturnRate(): number { return this.props.annualReturnRate }
  get startDate(): Date { return this.props.startDate }
  get teamId(): string { return this.props.teamId }
  get createdAt(): Date { return this.props.createdAt }

  public update(dto: UpdateInvestmentProps): Investment {
    const newProps = { ...this.props, ...dto }
    return new Investment(newProps)
  }
}