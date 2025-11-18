import type { Investment } from "../entities/investment"

export interface IInvestmentRepository {
  findByTeamId(teamId: string): Promise<Investment[]>
  findById(id: string, teamId: string): Promise<Investment | null>
  create(investment: Investment): Promise<Investment>
  update(investment: Investment): Promise<Investment>
  delete(id: string, teamId: string): Promise<void>
}