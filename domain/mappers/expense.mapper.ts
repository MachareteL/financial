import { DateUtils } from "@/domain/utils/date.utils";
import { Expense } from "../entities/expense";
import { Category } from "../entities/category";
import { User } from "../entities/user";
import type {
  ExpenseDetailsDTO,
  CreateExpenseDTO,
} from "../dto/expense.types.d.ts";
import type { Database } from "../dto/database.types.d.ts";
import { Mapper } from "../interfaces/mapper.interface";

type ExpenseRow = Database["public"]["Tables"]["expenses"]["Row"];
type ExpenseWithRelations = ExpenseRow & {
  category?: {
    id: string;
    name: string;
    budget_category_id: string | null;
  } | null;
  owner?: { name: string } | null;
};

export class ExpenseMapperImplementation implements Mapper<
  Expense,
  ExpenseDetailsDTO,
  CreateExpenseDTO
> {
  toDomain(raw: ExpenseWithRelations): Expense {
    return new Expense({
      id: raw.id,
      amount: raw.amount,
      description: raw.description || "",
      date: DateUtils.parse(raw.date) || DateUtils.now(),
      teamId: raw.team_id ?? "",
      userId: raw.user_id ?? "",
      categoryId: raw.category_id ?? "",
      receiptUrl: raw.receipt_url || null,
      isRecurring: raw.is_recurring || false,
      recurrenceType:
        (raw.recurrence_type as "monthly" | "weekly" | "yearly" | null) || null,
      isInstallment: raw.is_installment || false,
      installmentNumber: raw.installment_number || null,
      installmentValue: raw.installment_value || null,
      totalInstallments: raw.total_installments || null,
      parentExpenseId: raw.parent_expense_id || null,
      createdAt: DateUtils.parse(raw.created_at) || DateUtils.now(),
      // Handle optional relations if passed in raw
      category: raw.category
        ? new Category({
            id: raw.category.id,
            name: raw.category.name,
            budgetCategoryId: raw.category.budget_category_id ?? "",
            teamId: raw.team_id ?? "", // Assuming context or added to query
            createdAt: DateUtils.now(), // Placeholder if not queried
          })
        : null,
      owner: raw.owner
        ? new User({
            id: raw.user_id ?? "",
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
