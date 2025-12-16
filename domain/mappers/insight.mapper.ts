import { DateUtils } from "@/domain/utils/date.utils";
import { Insight } from "../entities/insight";
import type { InsightDTO } from "../dto/insight.types.d.ts";
import { Mapper } from "../interfaces/mapper.interface";

export class InsightMapperImplementation implements Mapper<
  Insight,
  InsightDTO
> {
  toDomain(raw: any): Insight {
    return new Insight({
      id: raw.id,
      teamId: raw.teamId,
      type: raw.type,
      title: raw.title,
      content: raw.content,
      isRead: raw.isRead,
      createdAt: DateUtils.parse(raw.createdAt) || DateUtils.now(),
      actionUrl: raw.actionUrl,
    });
  }

  toDTO(t: Insight): InsightDTO {
    return {
      id: t.id,
      teamId: t.teamId,
      type: t.type,
      title: t.title,
      content: t.content,
      isRead: t.isRead,
      createdAt: t.createdAt,
      actionUrl: t.actionUrl,
    };
  }
}

export const InsightMapper = new InsightMapperImplementation();
