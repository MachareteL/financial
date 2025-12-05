import { IFeedbackRepository } from "@/domain/interfaces/feedback.repository.interface";
import { Feedback } from "@/domain/entities/feedback";
import { SupabaseClient } from "@supabase/supabase-js";

export class SupabaseFeedbackRepository implements IFeedbackRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(feedback: Feedback): Promise<void> {
    const { type, title, description, email, userId } = feedback.props;

    const { error } = await this.supabase.from("feedbacks").insert({
      type,
      title,
      description,
      created_by: email || "Anonymous", // Map email to created_by
      user_id: userId || null, // Map userId if present
      status: "pending",
    });

    if (error) {
      console.error("Supabase error creating feedback:", error.message);
      // We don't throw here to avoid failing the whole process if DB fails but email sent?
      // Or we should throw. Let's throw to be consistent.
      throw new Error(`Failed to save feedback: ${error.message}`);
    }
  }
}
