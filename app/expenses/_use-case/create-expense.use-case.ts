// app/expenses/_use-case/create-expense.use-case.ts
import type { IExpenseRepository } from '@/domain/interfaces/expense.repository.interface'
import type { CreateExpenseDTO } from '@/domain/dto/expense.types.d.ts'
import { Expense } from '@/domain/entities/expense'

export class CreateExpenseUseCase {
  constructor(private expenseRepository: IExpenseRepository) {}

  async execute(dto: CreateExpenseDTO): Promise<void> {
    const baseDate = new Date(dto.date.replace(/-/g, '/')) // prevent timezone issues
    
    if (dto.isInstallment && dto.totalInstallments && dto.totalInstallments > 0) {
      const totalAmount = dto.amount
      const installmentAmount = totalAmount / dto.totalInstallments
      const parentId = crypto.randomUUID()

      for (let i = 1; i <= dto.totalInstallments; i++) {
        const installmentDate = new Date(baseDate)
        installmentDate.setMonth(baseDate.getMonth() + (i - 1))

        const expense = new Expense({
          id: i === 1 ? parentId : crypto.randomUUID(),
          amount: installmentAmount,
          description: `${dto.description} (${i}/${dto.totalInstallments})`,
          date: installmentDate,
          categoryId: dto.categoryId,
          teamId: dto.teamId,
          userId: dto.userId,
          receiptUrl: dto.receiptUrl,
          isRecurring: false,
          isInstallment: true,
          installmentNumber: i,
          totalInstallments: dto.totalInstallments,
          parentExpenseId: i === 1 ? null : parentId,
          createdAt: new Date(),
          category: null,
          owner: null,
        })
        
        await this.expenseRepository.create(expense)
      }
    } else {
      const expense = new Expense({
        id: crypto.randomUUID(),
        amount: dto.amount,
        description: dto.description,
        date: baseDate,
        categoryId: dto.categoryId,
        teamId: dto.teamId,
        userId: dto.userId,
        receiptUrl: dto.receiptUrl,
        isRecurring: dto.isRecurring ?? false,
        recurrenceType: dto.isRecurring ? dto.recurrenceType : null,
        isInstallment: false,
        installmentNumber: null,
        totalInstallments: null,
        parentExpenseId: null,
        createdAt: new Date(),
        category: null,
        owner: null,
      })

      await this.expenseRepository.create(expense)
    }
  }
}