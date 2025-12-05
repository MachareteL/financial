import { Feedback } from "@/domain/entities/feedback";

export interface IFeedbackRepository {
  create(feedback: Feedback): Promise<void>;
}
