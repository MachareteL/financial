import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/infrastructure/database/supabase.server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  const error = searchParams.get("error");
  const error_description = searchParams.get("error_description");
  if (error) {
    console.log(error);
    console.log(error_description);
    const errorUrl = request.nextUrl.clone();
    errorUrl.pathname = "/auth/auth-code-error";
    errorUrl.searchParams.set("error", error);
    if (error_description) {
      errorUrl.searchParams.set("error_description", error_description);
    }
    return NextResponse.redirect(errorUrl);
  }

  const supabase = await getSupabaseClient();

  if (code) {
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(
      code
    );

    if (!sessionError) {
      const redirectTo = request.nextUrl.clone();
      redirectTo.pathname = next;
      redirectTo.searchParams.delete("code");
      redirectTo.searchParams.delete("next");
      redirectTo.searchParams.delete("token_hash");
      redirectTo.searchParams.delete("type");
      return NextResponse.redirect(redirectTo);
    }

    const errorUrl = request.nextUrl.clone();
    errorUrl.pathname = "/auth/auth-code-error";
    errorUrl.searchParams.set("error", "invalid_code");
    errorUrl.searchParams.set("error_description", sessionError.message);
    return NextResponse.redirect(errorUrl);
  }

  if (token_hash && type) {
    const { error: otpError } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!otpError) {
      const redirectTo = request.nextUrl.clone();
      redirectTo.pathname = next;
      redirectTo.searchParams.delete("token_hash");
      redirectTo.searchParams.delete("type");
      redirectTo.searchParams.delete("next");
      return NextResponse.redirect(redirectTo);
    }

    const errorUrl = request.nextUrl.clone();
    errorUrl.pathname = "/auth/auth-code-error";
    errorUrl.searchParams.set("error", "invalid_token");
    errorUrl.searchParams.set("error_description", otpError.message);
    return NextResponse.redirect(errorUrl);
  }

  const errorUrl = request.nextUrl.clone();
  errorUrl.pathname = "/auth/auth-code-error";
  errorUrl.searchParams.set("error", "missing_params");
  errorUrl.searchParams.set(
    "error_description",
    "Link inválido ou expirado. Tente solicitar novamente."
  );
  return NextResponse.redirect(errorUrl);
}
