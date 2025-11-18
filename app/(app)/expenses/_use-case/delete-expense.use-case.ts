import type { IExpenseRepository } from "@/domain/interfaces/expense.repository.interface";
import type { DeleteExpenseDTO } from "@/domain/dto/expense.types.d.ts";

export class DeleteExpenseUseCase {
  constructor(private expenseRepository: IExpenseRepository) {}

  async execute(dto: DeleteExpenseDTO): Promise<void> {
    await this.expenseRepository.delete(dto.expenseId, dto.teamId);
  }
}
