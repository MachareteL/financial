import { z } from 'zod'

export const BudgetSchema = z.object({
  id: z.string().uuid(),
  month: z.number().min(1).max(12),
  year: z.number(),
  totalIncome: z.number().nonnegative(),
  necessidadesBudget: z.number().nonnegative(),
  desejosBudget: z.number().nonnegative(),
  poupancaBudget: z.number().nonnegative(),
  teamId: z.string().uuid(),
  createdAt: z.date(),
})

export type BudgetProps = z.infer<typeof BudgetSchema>

export type UpdateBudgetProps = Pick<
  BudgetProps,
  'totalIncome' | 'necessidadesBudget' | 'desejosBudget' | 'poupancaBudget'
>

export class Budget {
  public readonly props: BudgetProps

  constructor(props: BudgetProps) {
    this.props = BudgetSchema.parse(props)
  }

  get id(): string { return this.props.id }
  get month(): number { return this.props.month }
  get year(): number { return this.props.year }
  get totalIncome(): number { return this.props.totalIncome }
  get necessidadesBudget(): number { return this.props.necessidadesBudget }
  get desejosBudget(): number { return this.props.desejosBudget }
  get poupancaBudget(): number { return this.props.poupancaBudget }
  get teamId(): string { return this.props.teamId }
  get createdAt(): Date { return this.props.createdAt }
  
  get totalBudget(): number {
    return this.props.necessidadesBudget + this.props.desejosBudget + this.props.poupancaBudget
  }

  public update(dto: UpdateBudgetProps): Budget {
    const newProps = { ...this.props, ...dto }
    return new Budget(newProps)
  }
}