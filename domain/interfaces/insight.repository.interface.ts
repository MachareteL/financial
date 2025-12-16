import type { Insight } from "../entities/insight";

export interface IInsightRepository {
  create(insight: Insight): Promise<void>;
  findPendingByTeamId(teamId: string): Promise<Insight[]>;
  markAsRead(insightId: string): Promise<void>;
}
