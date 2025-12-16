import { DateUtils } from "@/domain/utils/date.utils";
import { Investment } from "../entities/investment";
import type {
  InvestmentDetailsDTO,
  CreateInvestmentDTO,
} from "../dto/investment.types.d.ts";
import { Mapper } from "../interfaces/mapper.interface";

export class InvestmentMapperImplementation implements Mapper<
  Investment,
  InvestmentDetailsDTO,
  CreateInvestmentDTO
> {
  toDomain(raw: any): Investment {
    return new Investment({
      id: raw.id,
      name: raw.name,
      type: raw.type,
      initialAmount: raw.initialAmount,
      currentAmount: raw.currentAmount,
      monthlyContribution: raw.monthlyContribution,
      annualReturnRate: raw.annualReturnRate,
      startDate: DateUtils.parse(raw.startDate) || DateUtils.now(),
      teamId: raw.teamId,
      createdAt: DateUtils.parse(raw.createdAt) || DateUtils.now(),
    });
  }

  toDTO(t: Investment): InvestmentDetailsDTO {
    return {
      id: t.id,
      name: t.name,
      type: t.type,
      initialAmount: t.initialAmount,
      currentAmount: t.currentAmount,
      monthlyContribution: t.monthlyContribution,
      annualReturnRate: t.annualReturnRate,
      startDate: DateUtils.toISODateString(t.startDate) || "",
      teamId: t.teamId,
    };
  }

  fromCreateDTO(dto: CreateInvestmentDTO): Investment {
    return new Investment({
      id: crypto.randomUUID(),
      name: dto.name,
      type: dto.type,
      initialAmount: dto.initialAmount,
      currentAmount: dto.currentAmount,
      monthlyContribution: dto.monthlyContribution,
      annualReturnRate: dto.annualReturnRate,
      startDate: DateUtils.parse(dto.startDate) || DateUtils.now(),
      teamId: dto.teamId,
      createdAt: DateUtils.now(),
    });
  }
}

export const InvestmentMapper = new InvestmentMapperImplementation();
