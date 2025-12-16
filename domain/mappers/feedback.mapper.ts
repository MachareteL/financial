import { DateUtils } from "@/domain/utils/date.utils";
import { Feedback } from "../entities/feedback";
import type { FeedbackDTO } from "../dto/feedback.dto";
import { Mapper } from "../interfaces/mapper.interface";

export class FeedbackMapperImplementation implements Mapper<
  Feedback,
  any,
  FeedbackDTO
> {
  // We prioritize fromCreateDTO here
  toDomain(raw: any): Feedback {
    return new Feedback({
      id: raw.id,
      type: raw.type,
      title: raw.title,
      description: raw.description,
      email: raw.email,
      userId: raw.userId,
      status: raw.status,
      createdAt: DateUtils.parse(raw.createdAt) || DateUtils.now(),
    });
  }

  toDTO(t: Feedback): any {
    // Not currently used in use cases viewed, implementing generic return matching raw entity for now or any
    return {
      id: t.id,
      type: t.type,
      title: t.title,
      description: t.description,
      email: t.email,
      userId: t.userId,
      status: t.status,
      createdAt: t.createdAt,
    };
  }

  fromCreateDTO(dto: FeedbackDTO): Feedback {
    return new Feedback({
      ...dto,
      status: "pending",
      // Entity might handle ID generation if optional, or we assume DB handles it.
      // But Feedback entity constructor calls schema parse.
      // Schema says ID optional.
    });
  }
}

export const FeedbackMapper = new FeedbackMapperImplementation();
