import { z } from 'zod'

export const BudgetCategorySchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid(),
  name: z.string().min(1, { message: 'O nome é obrigatório' }),
  percentage: z.number().min(0).max(1), // Armazena 0.5 para 50%
  createdAt: z.date(),
})

export type BudgetCategoryProps = z.infer<typeof BudgetCategorySchema>
export type UpdateBudgetCategoryProps = Partial<Pick<BudgetCategoryProps, 'name' | 'percentage'>>

export class BudgetCategory {
  public readonly props: BudgetCategoryProps

  constructor(props: BudgetCategoryProps) {
    this.props = BudgetCategorySchema.parse(props)
  }

  get id(): string { return this.props.id }
  get teamId(): string { return this.props.teamId }
  get name(): string { return this.props.name }
  get percentage(): number { return this.props.percentage }
  get createdAt(): Date { return this.props.createdAt }

  public update(dto: UpdateBudgetCategoryProps): BudgetCategory {
    const newProps = { ...this.props, ...dto }
    return new BudgetCategory(newProps)
  }
}