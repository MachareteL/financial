import type {
  SimulateInvestmentGrowthDTO,
  InvestmentGrowthProjectionDTO,
} from "@/domain/dto/investment.types.d.ts";

export class SimulateInvestmentGrowthUseCase {
  execute(dto: SimulateInvestmentGrowthDTO): InvestmentGrowthProjectionDTO[] {
    const { investments, years } = dto;
    const totalMonths = years * 12;
    const dataPoints: InvestmentGrowthProjectionDTO[] = [];

    // Estado inicial (Mês 0)
    let simulatedTotal = investments.reduce(
      (acc, inv) => acc + inv.currentAmount,
      0
    );
    let simulatedInvested = investments.reduce(
      (acc, inv) => acc + inv.currentAmount,
      0
    );

    for (let m = 0; m <= totalMonths; m++) {
      if (m > 0) {
        let monthGain = 0;
        let monthDeposit = 0;

        investments.forEach((inv) => {
          const monthlyRate = inv.annualReturnRate / 100 / 12;
          const estimatedAssetValue =
            inv.currentAmount + inv.monthlyContribution * m;

          monthGain += estimatedAssetValue * monthlyRate;
          monthDeposit += inv.monthlyContribution;
        });

        simulatedTotal += monthGain;
        simulatedTotal += monthDeposit;
        simulatedInvested += monthDeposit;
      }

      if (m % 3 === 0 || m === totalMonths) {
        dataPoints.push({
          month:
            m === 0
              ? "Hoje"
              : `${Math.floor(m / 12) > 0 ? Math.floor(m / 12) + "a " : ""}${
                  m % 12
                }m`,
          total: simulatedTotal,
          invested: simulatedInvested,
          yield: simulatedTotal - simulatedInvested,
        });
      }
    }

    return dataPoints;
  }
}
