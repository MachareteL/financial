import { DateUtils } from "@/domain/utils/date.utils";
import { Expense } from "../entities/expense";
import { Category } from "../entities/category";
import { User } from "../entities/user";
import type {
  ExpenseDetailsDTO,
  CreateExpenseDTO,
} from "../dto/expense.types.d.ts";
import { Mapper } from "../interfaces/mapper.interface";

export class ExpenseMapperImplementation implements Mapper<
  Expense,
  ExpenseDetailsDTO,
  CreateExpenseDTO
> {
  toDomain(raw: any): Expense {
    return new Expense({
      id: raw.id,
      amount: raw.amount,
      description: raw.description,
      date: DateUtils.parse(raw.date) || DateUtils.now(),
      teamId: raw.teamId,
      userId: raw.userId,
      categoryId: raw.categoryId,
      receiptUrl: raw.receiptUrl,
      isRecurring: raw.isRecurring,
      recurrenceType: raw.recurrenceType,
      isInstallment: raw.isInstallment,
      installmentNumber: raw.installmentNumber,
      installmentValue: raw.installmentValue,
      totalInstallments: raw.totalInstallments,
      parentExpenseId: raw.parentExpenseId,
      createdAt: DateUtils.parse(raw.createdAt) || DateUtils.now(),
      // Handle optional relations if passed in raw
      category: raw.category
        ? new Category({
            id: raw.category.id,
            name: raw.category.name,
            budgetCategoryId: raw.category.budgetCategoryId,
            teamId: raw.teamId, // Assuming context or added to query
            createdAt: DateUtils.now(), // Placeholder if not queried
          })
        : null,
      owner: raw.owner
        ? new User({
            id: raw.userId,
            name: raw.owner.name,
            email: "", // Placeholder
            createdAt: DateUtils.now(), // Placeholder
          })
        : null,
    });
  }

  toDTO(t: Expense): ExpenseDetailsDTO {
    return {
      id: t.id,
      amount: t.amount,
      description: t.description,
      date: DateUtils.toISODateString(t.date) || "",
      teamId: t.teamId,
      userId: t.userId,
      categoryId: t.categoryId,
      receiptUrl: t.receiptUrl,

      category: t.category
        ? {
            id: t.category.id,
            name: t.category.name,
            budgetCategoryName: null, // Assuming this needs to be populated if available, or kept null if not loaded
          }
        : null,

      owner: t.owner
        ? {
            name: t.owner.name,
          }
        : null,

      isRecurring: t.isRecurring,
      recurrenceType: t.recurrenceType,
      isInstallment: t.isInstallment,
      installmentNumber: t.installmentNumber,
      installmentValue: t.installmentValue,
      totalInstallments: t.totalInstallments,
    };
  }

  fromCreateDTO(dto: CreateExpenseDTO): Expense {
    // Note: This logic assumes a simple creation used in typical CRUD.
    // Complex logic should ideally be in a Factory or service if needed.
    return new Expense({
      id: crypto.randomUUID(),
      amount: dto.amount,
      description: dto.description,
      date: DateUtils.parse(dto.date) || DateUtils.now(),
      teamId: dto.teamId,
      userId: dto.userId,
      categoryId: dto.categoryId,
      receiptUrl: null, // File handling is usually separate
      isRecurring: dto.isRecurring || false,
      recurrenceType: dto.recurrenceType,
      isInstallment: dto.isInstallment || false,
      installmentValue: dto.installmentValue,
      totalInstallments: dto.totalInstallments,
      createdAt: DateUtils.now(),
    });
  }
}

export const ExpenseMapper = new ExpenseMapperImplementation();
