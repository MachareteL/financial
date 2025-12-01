import type { IExpenseRepository } from "@/domain/interfaces/expense.repository.interface";
import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";
import type { IStorageRepository } from "@/domain/interfaces/storage.repository.interface";
import type { CreateExpenseDTO } from "@/domain/dto/expense.types.d.ts";
import { Expense } from "@/domain/entities/expense";

import type { AnalyticsService } from "@/domain/interfaces/analytics-service.interface";

export class CreateExpenseUseCase {
  constructor(
    private expenseRepository: IExpenseRepository,
    private storageRepository: IStorageRepository,
    private teamRepository: ITeamRepository,
    private analyticsService: AnalyticsService
  ) {}

  async execute(dto: CreateExpenseDTO): Promise<void> {
    const hasPermission = await this.teamRepository.verifyPermission(
      dto.userId,
      dto.teamId,
      "MANAGE_EXPENSES"
    );

    if (!hasPermission) {
      throw new Error("Permissão negada: Você não pode criar despesas.");
    }

    let receiptUrl: string | null = null;

    if (dto.receiptFile && dto.userId) {
      try {
        const file = dto.receiptFile;
        const fileExt = file.name.split(".").pop() || "png";
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${dto.userId}/${fileName}`;

        receiptUrl = await this.storageRepository.upload(
          file,
          filePath,
          "receipts"
        );
      } catch (uploadError) {
        console.error("Falha no upload do recibo:", uploadError);
        receiptUrl = null;
      }
    }

    // 2. Lógica de Negócio (Parcelas ou Único)
    const baseDate = new Date(dto.date.replace(/-/g, "/"));
    const expensesToCreate: Expense[] = [];

    if (
      dto.isInstallment &&
      dto.totalInstallments &&
      dto.totalInstallments > 0
    ) {
      const totalAmount = dto.amount;
      const installmentAmount = totalAmount / dto.totalInstallments;
      const parentId = crypto.randomUUID();

      for (let i = 1; i <= dto.totalInstallments; i++) {
        const installmentDate = new Date(baseDate);
        installmentDate.setMonth(baseDate.getMonth() + (i - 1));

        const expense = new Expense({
          id: i === 1 ? parentId : crypto.randomUUID(),
          amount: installmentAmount,
          description: `${dto.description || "Gasto Parcelado"} (${i}/${
            dto.totalInstallments
          })`,
          date: installmentDate,
          categoryId: dto.categoryId,
          teamId: dto.teamId,
          userId: dto.userId,
          receiptUrl: i === 1 ? receiptUrl : null, // Anexa recibo só na 1ª parcela
          isRecurring: false,
          isInstallment: true,
          installmentNumber: i,
          installmentValue: installmentAmount,
          totalInstallments: dto.totalInstallments,
          parentExpenseId: i === 1 ? null : parentId,
          createdAt: new Date(),
          category: null,
          owner: null,
        });
        expensesToCreate.push(expense);
      }
    } else {
      // Gasto Único ou Recorrente
      const expense = new Expense({
        id: crypto.randomUUID(),
        amount: dto.amount,
        description: dto.description,
        date: baseDate,
        categoryId: dto.categoryId,
        teamId: dto.teamId,
        userId: dto.userId,
        receiptUrl: receiptUrl,
        isRecurring: dto.isRecurring ?? false,
        recurrenceType: dto.isRecurring ? dto.recurrenceType : null,
        isInstallment: false,
        installmentNumber: null,
        installmentValue: null,
        totalInstallments: null,
        parentExpenseId: null,
        createdAt: new Date(),
        category: null,
        owner: null,
      });
      expensesToCreate.push(expense);
    }

    if (expensesToCreate.length > 0) {
      await this.expenseRepository.createMany(expensesToCreate);
      await this.analyticsService.track(dto.userId, "feature_used", {
        feature: "manual_expense",
      });
    }
  }
}
