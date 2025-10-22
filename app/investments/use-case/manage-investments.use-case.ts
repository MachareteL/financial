import type { IInvestmentRepository } from "@/domain/repositories/investment.repository.interface"
import type { Investment } from "@/domain/entities/investment.entity"

export interface CreateInvestmentDTO {
  familyId: string
  userId: string
  name: string
  type: string
  amount: number
  currentValue: number
  purchaseDate: Date
  notes?: string
}

export interface UpdateInvestmentDTO {
  investmentId: string
  familyId: string
  name?: string
  type?: string
  amount?: number
  currentValue?: number
  purchaseDate?: Date
  notes?: string
}

export interface DeleteInvestmentDTO {
  investmentId: string
  familyId: string
}

export class ManageInvestmentsUseCase {
  constructor(private investmentRepository: IInvestmentRepository) {}

  async getInvestments(familyId: string): Promise<Investment[]> {
    return await this.investmentRepository.getInvestmentsByFamily(familyId)
  }

  async createInvestment(dto: CreateInvestmentDTO): Promise<Investment> {
    return await this.investmentRepository.createInvestment({
      familyId: dto.familyId,
      userId: dto.userId,
      name: dto.name,
      type: dto.type,
      amount: dto.amount,
      currentValue: dto.currentValue,
      purchaseDate: dto.purchaseDate,
      notes: dto.notes,
    })
  }

  async updateInvestment(dto: UpdateInvestmentDTO): Promise<Investment> {
    return await this.investmentRepository.updateInvestment(dto.investmentId, dto.familyId, {
      name: dto.name,
      type: dto.type,
      amount: dto.amount,
      currentValue: dto.currentValue,
      purchaseDate: dto.purchaseDate,
      notes: dto.notes,
    })
  }

  async deleteInvestment(dto: DeleteInvestmentDTO): Promise<void> {
    await this.investmentRepository.deleteInvestment(dto.investmentId, dto.familyId)
  }
}
