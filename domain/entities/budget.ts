import { z } from 'zod'

export const BudgetSchema = z.object({
  id: z.string().uuid(),
  month: z.number().min(1).max(12),
  year: z.number(),
  totalIncome: z.number().nonnegative(),
  teamId: z.string().uuid(),
  createdAt: z.date(),
})

export type BudgetProps = z.infer<typeof BudgetSchema>
export type UpdateBudgetProps = Pick<BudgetProps, 'totalIncome'>

export class Budget {
  public readonly props: BudgetProps

  constructor(props: BudgetProps) {
    this.props = BudgetSchema.parse(props)
  }

  get id(): string { return this.props.id }
  get month(): number { return this.props.month }
  get year(): number { return this.props.year }
  get totalIncome(): number { return this.props.totalIncome }
  get teamId(): string { return this.props.teamId }
  get createdAt(): Date { return this.props.createdAt }

  public update(dto: UpdateBudgetProps): Budget {
    const newProps = { ...this.props, ...dto }
    return new Budget(newProps)
  }
}