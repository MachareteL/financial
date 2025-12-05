export type InvestmentDetailsDTO = {
  id: string;
  name: string;
  type: "savings" | "stocks" | "bonds" | "real_estate" | "crypto" | "other";
  initialAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  annualReturnRate: number;
  startDate: string; // string para UI (YYYY-MM-DD)
  teamId: string;
};

export type CreateInvestmentDTO = {
  name: string;
  type: "savings" | "stocks" | "bonds" | "real_estate" | "crypto" | "other";
  initialAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  annualReturnRate: number;
  startDate: string;
  teamId: string;
  userId: string;
};

export type UpdateInvestmentDTO = {
  investmentId: string;
  teamId: string;
  userId: string;
  name?: string;
  type?: "savings" | "stocks" | "bonds" | "real_estate" | "crypto" | "other";
  initialAmount?: number;
  currentAmount?: number;
  monthlyContribution?: number;
  annualReturnRate?: number;
  startDate?: string;
};

export type DeleteInvestmentDTO = {
  investmentId: string;
  teamId: string;
  userId: string;
};

export type SimulateInvestmentGrowthDTO = {
  investments: InvestmentDetailsDTO[];
  years: number;
};

export type InvestmentGrowthProjectionDTO = {
  month: string;
  total: number;
  invested: number;
  yield: number;
};
