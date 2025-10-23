// domain/entities/expense.ts
import { z } from 'zod';

export const ExpenseSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().nonnegative(),
  description: z.string().optional(),
  date: z.date(),
  categoryId: z.string().uuid(),
  familyId: z.string().uuid(),
  userId: z.string().uuid(),
  isRecurring: z.boolean().default(false),
  recurrenceType: z.enum(['monthly','weekly','yearly']).nullable().default(null),
  isInstallment: z.boolean().default(false),
  installmentNumber: z.number().nullable(),
  totalInstallments: z.number().nullable(),
  installmentValue: z.number().nullable(),
  parentExpenseId: z.string().uuid().nullable(),
  createdAt: z.date(),
});

export type ExpenseProps = z.infer<typeof ExpenseSchema>;

export class Expense {
  private props: ExpenseProps;

  constructor(props: ExpenseProps) {
    ExpenseSchema.parse(props);
    this.props = props;
  }

  get amount(): number { return this.props.amount }
  get date(): Date { return this.props.date }

  isPaid(): boolean {
    return this.props.amount > 0;
  }
}
