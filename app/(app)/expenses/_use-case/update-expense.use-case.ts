import type { IExpenseRepository } from "@/domain/interfaces/expense.repository.interface";
import type { IStorageRepository } from "@/domain/interfaces/storage.repository.interface"; // <-- Importar
import type { UpdateExpenseDTO } from "@/domain/dto/expense.types.d.ts";
import type { UpdateExpenseProps } from "@/domain/entities/expense";

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
      throw new Error("Você não tem permissão para editar despesas.");
    }
    const existingExpense = await this.expenseRepository.findById(
      dto.expenseId,
      dto.teamId
    );

    if (!existingExpense) {
      throw new Error(
        "Não encontramos essa despesa ou você não tem permissão."
      );
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
        throw new Error("Falha ao enviar o recibo. Tente novamente.");
      }
    }

    const updateProps: UpdateExpenseProps = {
      description: dto.description,
      amount: dto.amount,
      categoryId: dto.categoryId,
      receiptUrl: finalReceiptUrl,
      installmentValue: dto.installmentValue,
    };

    if (dto.date) {
      updateProps.date = new Date(dto.date.replace(/-/g, "/"));
    }

    // Remove undefined keys so they don't overwrite existing values
    Object.keys(updateProps).forEach(
      (key) =>
        updateProps[key as keyof UpdateExpenseProps] === undefined &&
        delete updateProps[key as keyof UpdateExpenseProps]
    );

    const updatedExpense = existingExpense.update(updateProps);

    await this.expenseRepository.update(updatedExpense);
  }
}
