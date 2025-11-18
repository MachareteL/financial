import { z } from 'zod'
import { BudgetCategory } from './budget-category'

export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, { message: 'O nome é obrigatório' }),
  budgetCategoryId: z.string().uuid(),
  teamId: z.string().uuid(),
  createdAt: z.date(),
  
  budgetCategory: z.instanceof(BudgetCategory).nullish(),
})

export type CategoryProps = z.infer<typeof CategorySchema>
export type UpdateCategoryProps = Partial<Pick<CategoryProps, 'name' | 'budgetCategoryId'>>

export class Category {
  public readonly props: CategoryProps

  constructor(props: CategoryProps) {
    this.props = CategorySchema.parse(props)
  }

  get id(): string { return this.props.id }
  get name(): string { return this.props.name }
  get budgetCategoryId(): string { return this.props.budgetCategoryId }
  get teamId(): string { return this.props.teamId }
  get createdAt(): Date { return this.props.createdAt }
  
  get budgetCategory(): BudgetCategory | null | undefined { return this.props.budgetCategory }

  public update(dto: UpdateCategoryProps): Category {
    const newProps = { ...this.props, ...dto }
    return new Category(newProps)
  }
}