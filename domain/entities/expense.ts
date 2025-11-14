import { z } from 'zod'
import { Category } from './category'


export const ExpenseSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().nonnegative(),
  description: z.string().nullish(),
  date: z.date(),
  teamId: z.string().uuid(),
  userId: z.string().uuid(),
  categoryId: z.string().uuid(),
  receiptUrl: z.string().nullish(),
  isRecurring: z.boolean().default(false),
  recurrenceType: z.enum(['monthly', 'weekly', 'yearly']).nullish(),
  isInstallment: z.boolean().default(false),
  installmentNumber: z.number().int().nullish(),
  totalInstallments: z.number().int().nullish(),
  parentExpenseId: z.string().uuid().nullish(),
  createdAt: z.date(),
  

  category: z.instanceof(Category).nullish(),
  owner: z.object({
    name: z.string(),
  }).nullish(),
})

export type ExpenseProps = z.infer<typeof ExpenseSchema>


export type UpdateExpenseProps = Partial<Pick<ExpenseProps,
  'amount' | 'description' | 'date' | 'categoryId' | 'receiptUrl'
>>

export class Expense {
  public readonly props: ExpenseProps

  constructor(props: ExpenseProps) {
    this.props = ExpenseSchema.parse(props)
  }

  get id(): string { return this.props.id }
  get amount(): number { return this.props.amount }
  get description(): string | null | undefined { return this.props.description }
  get date(): Date { return this.props.date }
  get teamId(): string { return this.props.teamId }
  get userId(): string { return this.props.userId }
  get categoryId(): string { return this.props.categoryId }
  get category(): Category | null | undefined { return this.props.category }
  get owner(): { name: string } | null | undefined { return this.props.owner }
  get receiptUrl(): string | null | undefined { return this.props.receiptUrl }
  get isRecurring(): boolean { return this.props.isRecurring }
  get recurrenceType(): 'monthly' | 'weekly' | 'yearly' | null | undefined { return this.props.recurrenceType }
  get isInstallment(): boolean { return this.props.isInstallment }
  get installmentNumber(): number | null | undefined { return this.props.installmentNumber }
  get totalInstallments(): number | null | undefined { return this.props.totalInstallments }
  get parentExpenseId(): string | null | undefined { return this.props.parentExpenseId }
  get createdAt(): Date { return this.props.createdAt }


  public update(dto: UpdateExpenseProps): Expense {
    const newProps = { ...this.props, ...dto }
    return new Expense(newProps)
  }
}