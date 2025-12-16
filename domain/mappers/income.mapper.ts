import { DateUtils } from "@/domain/utils/date.utils";
import { Income } from "../entities/income";
import type {
  IncomeDetailsDTO,
  CreateIncomeDTO,
} from "../dto/income.types.d.ts";
import { Mapper } from "../interfaces/mapper.interface";

export class IncomeMapperImplementation implements Mapper<
  Income,
  IncomeDetailsDTO,
  CreateIncomeDTO
> {
  toDomain(raw: any): Income {
    return new Income({
      id: raw.id,
      amount: raw.amount,
      description: raw.description,
      type: raw.type,
      frequency: raw.frequency,
      date: DateUtils.parse(raw.date) || DateUtils.now(),
      teamId: raw.teamId,
      userId: raw.userId,
      createdAt: DateUtils.parse(raw.createdAt) || DateUtils.now(),
    });
  }

  toDTO(t: Income): IncomeDetailsDTO {
    return {
      id: t.id,
      amount: t.amount,
      description: t.description,
      type: t.type,
      frequency: t.frequency,
      date: DateUtils.toISODateString(t.date) || "",
      userId: t.userId,
    };
  }

  fromCreateDTO(dto: CreateIncomeDTO): Income {
    return new Income({
      id: crypto.randomUUID(),
      amount: dto.amount,
      description: dto.description,
      type: dto.type,
      frequency: dto.frequency,
      date: DateUtils.parse(dto.date) || DateUtils.now(),
      teamId: dto.teamId,
      userId: dto.userId,
      createdAt: DateUtils.now(),
    });
  }
}

export const IncomeMapper = new IncomeMapperImplementation();
