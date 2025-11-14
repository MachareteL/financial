import { z } from 'zod'

export const IncomeSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().nonnegative({ message: 'O valor deve ser positivo' }),
  description: z.string().nullish(),
  type: z.enum(['recurring', 'one_time']),
  frequency: z.enum(['monthly', 'weekly', 'yearly']).nullish(),
  date: z.date({ message: 'Data inválida' }),
  teamId: z.string().uuid(),
  userId: z.string().uuid(),
  createdAt: z.date(),
  owner: z.string().nullish(),
})

export type IncomeProps = z.infer<typeof IncomeSchema>

export type UpdateIncomeProps = Partial<Pick<IncomeProps, 
  'amount' | 'description' | 'type' | 'frequency' | 'date'
>>

export class Income {
  public readonly props: IncomeProps

  constructor(props: IncomeProps) {
    this.props = IncomeSchema.parse(props)
  }

  get id(): string { return this.props.id }
  get amount(): number { return this.props.amount }
  get description(): string | null | undefined { return this.props.description }
  get type(): 'recurring' | 'one_time' { return this.props.type }
  get frequency(): 'monthly' | 'weekly' | 'yearly' | null | undefined { return this.props.frequency }
  get date(): Date { return this.props.date }
  get teamId(): string { return this.props.teamId }
  get userId(): string { return this.props.userId }
  get createdAt(): Date { return this.props.createdAt }
  get owner(): string | null | undefined { return this.props.owner }

  public isMonthlyRecurring(): boolean {
    return this.props.type === 'recurring' && this.props.frequency === 'monthly'
  }

  public update(dto: UpdateIncomeProps): Income {
    const newProps = {
      ...this.props,
      ...dto,
      frequency: (dto.type === 'one_time' || (dto.type === undefined && this.props.type === 'one_time'))
        ? null
        : dto.frequency ?? this.props.frequency,
    }
    
    return new Income(newProps)
  }
}