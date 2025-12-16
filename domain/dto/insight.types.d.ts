export type InsightType = "WEEKLY_REPORT" | "BUDGET_ALERT" | "INVESTMENT_TIP";

export type InsightDTO = {
  id: string;
  teamId: string;
  type: InsightType;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl: string | null | undefined;
};
