import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes
  if (
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/account")
  ) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  }

  // Auth routes (redirect to dashboard if already logged in)
  if (request.nextUrl.pathname.startsWith("/auth")) {
    // Allow access to verify-code page even if logged in (edge case) or not
    // But generally if logged in, auth pages should redirect.
    // Exception: maybe verify-code needs to be accessible?
    // Actually, verify-code is part of auth flow, user is NOT logged in yet usually.
    // But if they are logged in, they shouldn't be in /auth/signin etc.
    // Let's keep it simple: if logged in, redirect to dashboard, UNLESS it's a specific sub-route?
    // For now, standard behavior:
    if (user && !request.nextUrl.pathname.includes("/auth/sign-out")) {
      // If user is logged in, they shouldn't access /auth page
      // But wait, what if they are verifying code? They are NOT logged in yet.
      // So this check is fine.
      // However, if they ARE logged in, they shouldn't see the login page.
      // Let's only redirect from the main /auth page or signin/signup
      if (request.nextUrl.pathname === "/auth") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
