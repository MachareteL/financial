import { z } from "zod";

// We can reuse the schema inference or define explicit type
export interface FeedbackDTO {
  type: "bug" | "suggestion" | "complaint" | "other";
  title: string;
  description: string;
  email?: string;
  userId?: string;
}
