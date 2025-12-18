import { NextRequest, NextResponse } from "next/server";
import { getGenerateBatchWeeklyReportsUseCase } from "@/infrastructure/dependency-injection/server-container";
import { env } from "@/lib/env";

export async function GET(req: NextRequest) {
  // Ensure CRON_SECRET is configured in production
  if (!env.CRON_SECRET) {
    return new NextResponse("Service not configured", { status: 503 });
  }

  const authHeader = req.headers.get("authorization");

  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const useCase = await getGenerateBatchWeeklyReportsUseCase();
    const result = await useCase.execute();

    return NextResponse.json({
      message: "Batch processing complete",
      stats: result,
    });
  } catch (error) {
    console.error("Cron job failed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
