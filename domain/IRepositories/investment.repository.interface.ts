import type { Investment } from "../Entities/investment.entity"

export interface IInvestmentRepository {
  getInvestmentsByFamily(familyId: string): Promise<Investment[]>
  getInvestmentById(investmentId: string, familyId: string): Promise<Investment | null>
  createInvestment(investment: Omit<Investment, "id" | "createdAt">): Promise<Investment>
  updateInvestment(investmentId: string, familyId: string, data: Partial<Investment>): Promise<Investment>
  deleteInvestment(investmentId: string, familyId: string): Promise<void>
}
