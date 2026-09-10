import { NextResponse, type NextRequest } from "next/server";
import {
  getConfigurationIssue,
  isAuthDisabled,
  isProductionRuntime,
} from "@/lib/runtime";
import { createMiddlewareSupabase } from "@/lib/supabase/middleware";

const PUBLIC_PREFIXES = ["/login", "/auth/configuration-error"];
const STATIC_PREFIXES = ["/_next", "/favicon", "/icon", "/apple-icon", "/manifest"];

function isPublicPath(pathname: string) {
  return PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isStaticAsset(pathname: string) {
  return STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  const configIssue = getConfigurationIssue();
  if (configIssue && !pathname.startsWith("/auth/configuration-error")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/configuration-error";
    url.searchParams.set("reason", configIssue);
    return NextResponse.redirect(url);
  }

  if (isAuthDisabled()) {
    if (pathname.startsWith("/login")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const { supabase, response: refreshed } = await createMiddlewareSupabase(request, response);
  response = refreshed;

  if (!supabase) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/configuration-error";
    url.searchParams.set("reason", "missing_supabase");
    return NextResponse.redirect(url);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && pathname.startsWith("/login")) {
    const next = request.nextUrl.searchParams.get("next");
    const destination = next && next.startsWith("/") && !next.startsWith("/login") ? next : "/dashboard";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    if (pathname !== "/") {
      url.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(url);
  }

  if (isProductionRuntime()) {
    response.headers.set("X-RYVON-Auth", user ? "authenticated" : "guest");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
