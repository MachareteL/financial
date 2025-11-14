import { z } from 'zod';

export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, { message: 'O nome é obrigatório' }),
  classification: z.enum(['necessidades', 'desejos', 'poupanca']),
  teamId: z.string().uuid(),
  createdAt: z.date(),
})

export type CategoryProps = z.infer<typeof CategorySchema>

export type UpdateCategoryProps = Partial<Pick<CategoryProps, 'name' | 'classification'>>

export class Category {
  public readonly props: CategoryProps

  constructor(props: CategoryProps) {
    this.props = CategorySchema.parse(props)
  }

  get id(): string { return this.props.id }
  get name(): string { return this.props.name }
  get classification(): 'necessidades' | 'desejos' | 'poupanca' { return this.props.classification }
  get teamId(): string { return this.props.teamId }
  get createdAt(): Date { return this.props.createdAt }


  public update(dto: UpdateCategoryProps): Category {
    const newProps = {
      ...this.props,
      ...dto,
    }
    return new Category(newProps)
  }
}