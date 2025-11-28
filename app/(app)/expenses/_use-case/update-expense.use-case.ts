import type { IExpenseRepository } from "@/domain/interfaces/expense.repository.interface";
import type { IStorageRepository } from "@/domain/interfaces/storage.repository.interface"; // <-- Importar
import type { UpdateExpenseDTO } from "@/domain/dto/expense.types.d.ts";

import type { ITeamRepository } from "@/domain/interfaces/team.repository.interface";

export class UpdateExpenseUseCase {
  constructor(
    private expenseRepository: IExpenseRepository,
    private storageRepository: IStorageRepository,
    private teamRepository: ITeamRepository
  ) {}

  async execute(dto: UpdateExpenseDTO): Promise<void> {
    const hasPermission = await this.teamRepository.verifyPermission(
      dto.userId,
      dto.teamId,
      "MANAGE_EXPENSES"
    );

    if (!hasPermission) {
      throw new Error("Permissão negada: Você não pode editar despesas.");
    }
    const existingExpense = await this.expenseRepository.findById(
      dto.expenseId,
      dto.teamId
    );

    if (!existingExpense) {
      throw new Error("Gasto não encontrado ou você não tem permissão");
    }

    let finalReceiptUrl = dto.receiptUrl;

    if (dto.receiptFile) {
      try {
        const file = dto.receiptFile;
        const fileExt = file.name.split(".").pop() || "png";
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${existingExpense.userId}/${fileName}`;

        finalReceiptUrl = await this.storageRepository.upload(
          file,
          filePath,
          "receipts"
        );
      } catch (error) {
        console.error("Erro ao atualizar recibo:", error);
        throw new Error("Falha ao fazer upload do novo recibo.");
      }
    }

    const updatedExpense = existingExpense.update({
      description: dto.description,
      amount: dto.amount,
      date: dto.date ? new Date(dto.date.replace(/-/g, "/")) : undefined,
      categoryId: dto.categoryId,
      receiptUrl: finalReceiptUrl,
      installmentValue: dto.installmentValue,
    });

    await this.expenseRepository.update(updatedExpense);
  }
}
